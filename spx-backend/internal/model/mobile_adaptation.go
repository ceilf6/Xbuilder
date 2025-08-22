// spx-backend/internal/model/mobile_adaptation.go
package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
)

// MobileAdaptation is the model for mobile adaptations.
type MobileAdaptation struct {
	Model

	// ProjectID is the ID of the project that the adaptation is associated with.
	ProjectID int64    `gorm:"column:project_id;index"`
	Project   *Project `gorm:"foreignKey:ProjectID"`

	// AdaptationType is the type of adaptation.
	// 1: No keyboard needed (无需按键)
	// 2: Custom keyboard (自定义按键)
	AdaptationType int `gorm:"column:adaptation_type;not null;default:1"`

	// ZoneToKey contains the mapping from zone ID to key name.
	// Only applicable when AdaptationType is 2 (custom keyboard).
	ZoneToKey ZoneToKeyMapping `gorm:"column:zone_to_key;type:json"`
}

// TableName implements [gorm.io/gorm/schema.Tabler].
func (MobileAdaptation) TableName() string {
	return "mobile_adaptation"
}

// IsNoKeyboard returns true if the adaptation type indicates no keyboard is needed.
func (ma *MobileAdaptation) IsNoKeyboard() bool {
	return ma.AdaptationType == 1
}

// IsCustomKeyboard returns true if the adaptation type indicates custom keyboard is needed.
func (ma *MobileAdaptation) IsCustomKeyboard() bool {
	return ma.AdaptationType == 2
}

// ZoneId represents the zone ID type for virtual keyboard.
type ZoneId string

// Zone ID constants for the 10 virtual keyboard zones.
const (
	ZoneIdLT      ZoneId = "lt"      // Left Top
	ZoneIdRT      ZoneId = "rt"      // Right Top
	ZoneIdLBUp    ZoneId = "lbUp"    // Left Bottom Up
	ZoneIdLBLeft  ZoneId = "lbLeft"  // Left Bottom Left
	ZoneIdLBRight ZoneId = "lbRight" // Left Bottom Right
	ZoneIdLBDown  ZoneId = "lbDown"  // Left Bottom Down
	ZoneIdRBA     ZoneId = "rbA"     // Right Bottom A
	ZoneIdRBB     ZoneId = "rbB"     // Right Bottom B
	ZoneIdRBX     ZoneId = "rbX"     // Right Bottom X
	ZoneIdRBY     ZoneId = "rbY"     // Right Bottom Y
)

// AllZoneIds returns all valid zone IDs.
func AllZoneIds() []ZoneId {
	return []ZoneId{
		ZoneIdLT, ZoneIdRT, ZoneIdLBUp, ZoneIdLBLeft, ZoneIdLBRight,
		ZoneIdLBDown, ZoneIdRBA, ZoneIdRBB, ZoneIdRBX, ZoneIdRBY,
	}
}

// IsValid checks if the zone ID is valid.
func (z ZoneId) IsValid() bool {
	for _, validZone := range AllZoneIds() {
		if z == validZone {
			return true
		}
	}
	return false
}

// ZoneToKeyMapping is a map from zone ID to key name.
// Key name can be null (represented as nil pointer) if the zone is not mapped to any key.
type ZoneToKeyMapping map[ZoneId]*string

// Scan implements [sql.Scanner].
func (ztkm *ZoneToKeyMapping) Scan(src any) error {
	switch src := src.(type) {
	case []byte:
		var parsed ZoneToKeyMapping
		if err := json.Unmarshal(src, &parsed); err != nil {
			return fmt.Errorf("failed to unmarshal ZoneToKeyMapping: %w", err)
		}
		*ztkm = parsed
	case string:
		var parsed ZoneToKeyMapping
		if err := json.Unmarshal([]byte(src), &parsed); err != nil {
			return fmt.Errorf("failed to unmarshal ZoneToKeyMapping: %w", err)
		}
		*ztkm = parsed
	case nil:
		*ztkm = make(ZoneToKeyMapping)
	default:
		return errors.New("incompatible type for ZoneToKeyMapping")
	}
	return nil
}

// Value implements [driver.Valuer].
func (ztkm ZoneToKeyMapping) Value() (driver.Value, error) {
	if ztkm == nil {
		return nil, nil
	}
	return json.Marshal(ztkm)
}

// SetKey sets the key for a given zone.
func (ztkm ZoneToKeyMapping) SetKey(zone ZoneId, key *string) error {
	if !zone.IsValid() {
		return fmt.Errorf("invalid zone ID: %s", zone)
	}
	if ztkm == nil {
		return errors.New("ZoneToKeyMapping is nil")
	}
	ztkm[zone] = key
	return nil
}

// GetKey gets the key for a given zone.
func (ztkm ZoneToKeyMapping) GetKey(zone ZoneId) (*string, bool) {
	if ztkm == nil {
		return nil, false
	}
	key, exists := ztkm[zone]
	return key, exists
}

// RemoveKey removes the key mapping for a given zone.
func (ztkm ZoneToKeyMapping) RemoveKey(zone ZoneId) {
	if ztkm != nil {
		delete(ztkm, zone)
	}
}

// Clone creates a deep copy of the mapping.
func (ztkm ZoneToKeyMapping) Clone() ZoneToKeyMapping {
	if ztkm == nil {
		return make(ZoneToKeyMapping)
	}
	
	cloned := make(ZoneToKeyMapping, len(ztkm))
	for zone, key := range ztkm {
		if key != nil {
			keyValue := *key
			cloned[zone] = &keyValue
		} else {
			cloned[zone] = nil
		}
	}
	return cloned
}

// GetMappedZones returns all zones that have key mappings (including nil mappings).
func (ztkm ZoneToKeyMapping) GetMappedZones() []ZoneId {
	if ztkm == nil {
		return nil
	}
	
	zones := make([]ZoneId, 0, len(ztkm))
	for zone := range ztkm {
		zones = append(zones, zone)
	}
	return zones
}

// GetActiveZones returns all zones that have non-nil key mappings.
func (ztkm ZoneToKeyMapping) GetActiveZones() []ZoneId {
	if ztkm == nil {
		return nil
	}
	
	var zones []ZoneId
	for zone, key := range ztkm {
		if key != nil {
			zones = append(zones, zone)
		}
	}
	return zones
}

// Validate validates the mapping to ensure all zone IDs are valid.
func (ztkm ZoneToKeyMapping) Validate() error {
	if ztkm == nil {
		return nil
	}
	
	for zone := range ztkm {
		if !zone.IsValid() {
			return fmt.Errorf("invalid zone ID in mapping: %s", zone)
		}
	}
	return nil
}