class OldNode < ActiveRecord::Base
  include GeoRecord
  include ConsistencyValidations
  include ObjectMetadata

  self.table_name = "nodes"
  self.primary_keys = "node_id", "version"

  # note this needs to be included after the table name changes, or
  # the queries generated by Redactable will use the wrong table name.
  include Redactable

  validates_presence_of :changeset_id, :timestamp
  validates_inclusion_of :visible, :in => [ true, false ]
  validates_numericality_of :latitude, :longitude
  validate :validate_position
  validates_associated :changeset

  belongs_to :changeset
  belongs_to :redaction
  belongs_to :current_node, :class_name => "Node", :foreign_key => "node_id"

  has_many :old_tags, :class_name => 'OldNodeTag', :foreign_key => [:node_id, :version]

  def validate_position
    errors.add(:base, "Node is not in the world") unless in_world?
  end

  def self.from_node(node)
    old_node = OldNode.new
    old_node.latitude = node.latitude
    old_node.longitude = node.longitude
    old_node.visible = node.visible
    old_node.tags = node.tags
    old_node.timestamp = node.timestamp
    old_node.changeset_id = node.changeset_id
    old_node.node_id = node.id
    old_node.version = node.version
    return old_node
  end
  
  def to_xml
    doc = OSM::API.new.get_xml_doc
    doc.root << to_xml_node()
    return doc
  end

  def to_xml_node(changeset_cache = {}, user_display_name_cache = {})
    el = XML::Node.new 'node'
    el['id'] = self.node_id.to_s

    add_metadata_to_xml_node(el, self, changeset_cache, user_display_name_cache)

    if self.visible?
      el['lat'] = self.lat.to_s
      el['lon'] = self.lon.to_s
    end

    add_tags_to_xml_node(el, self.old_tags)

    return el
  end

  def save_with_dependencies!
    save!
    #not sure whats going on here
    clear_aggregation_cache
    clear_association_cache
    #ok from here
    @attributes.update(OldNode.where(:node_id => self.node_id, :timestamp => self.timestamp, :version => self.version).first.instance_variable_get('@attributes'))
   
    self.tags.each do |k,v|
      tag = OldNodeTag.new
      tag.k = k
      tag.v = v
      tag.node_id = self.node_id
      tag.version = self.version
      tag.save!
    end
  end

  def tags
    @tags ||= Hash[self.old_tags.collect { |t| [t.k, t.v] }]
  end

  def tags=(t)
    @tags = t 
  end

  def tags_as_hash 
    return self.tags
  end 
 
  # Pretend we're not in any ways 
  def ways 
    return [] 
  end 
 
  # Pretend we're not in any relations 
  def containing_relation_members 
    return [] 
  end 

  # check whether this element is the latest version - that is,
  # has the same version as its "current" counterpart.
  def is_latest_version?
    current_node.version == self.version
  end
end
