// spx-backend/internal/model/mobile_adaptation_test.go
package model

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMobileAdaptation(t *testing.T) {
	t.Run("TableName", func(t *testing.T) {
		ma := MobileAdaptation{}
		assert.Equal(t, "mobile_adaptation", ma.TableName())
	})

	t.Run("IsNoKeyboard", func(t *testing.T) {
		ma := MobileAdaptation{AdaptationType: 1}
		assert.True(t, ma.IsNoKeyboard())
		assert.False(t, ma.IsCustomKeyboard())
	})

	t.Run("IsCustomKeyboard", func(t *testing.T) {
		ma := MobileAdaptation{AdaptationType: 2}
		assert.False(t, ma.IsNoKeyboard())
		assert.True(t, ma.IsCustomKeyboard())
	})
}

func TestZoneId(t *testing.T) {
	t.Run("AllZoneIds", func(t *testing.T) {
		zones := AllZoneIds()
		assert.Len(t, zones, 10)
		assert.Contains(t, zones, ZoneIdLT)
		assert.Contains(t, zones, ZoneIdRT)
		assert.Contains(t, zones, ZoneIdLBUp)
		assert.Contains(t, zones, ZoneIdLBLeft)
		assert.Contains(t, zones, ZoneIdLBRight)
		assert.Contains(t, zones, ZoneIdLBDown)
		assert.Contains(t, zones, ZoneIdRBA)
		assert.Contains(t, zones, ZoneIdRBB)
		assert.Contains(t, zones, ZoneIdRBX)
		assert.Contains(t, zones, ZoneIdRBY)
	})

	t.Run("IsValid", func(t *testing.T) {
		assert.True(t, ZoneIdLT.IsValid())
		assert.True(t, ZoneIdRT.IsValid())
		assert.True(t, ZoneIdRBY.IsValid())
		assert.False(t, ZoneId("invalid").IsValid())
		assert.False(t, ZoneId("").IsValid())
	})
}

func TestZoneToKeyMapping(t *testing.T) {
	t.Run("SetKey", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		err := ztkm.SetKey(ZoneIdLT, &keyA)
		require.NoError(t, err)
		
		key, exists := ztkm.GetKey(ZoneIdLT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyA", *key)
	})

	t.Run("SetKey_InvalidZone", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		err := ztkm.SetKey(ZoneId("invalid"), &keyA)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid zone ID")
	})

	t.Run("SetKey_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		keyA := "KeyA"
		
		err := ztkm.SetKey(ZoneIdLT, &keyA)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "ZoneToKeyMapping is nil")
	})

	t.Run("GetKey_NotExists", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		
		key, exists := ztkm.GetKey(ZoneIdLT)
		assert.False(t, exists)
		assert.Nil(t, key)
	})

	t.Run("GetKey_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		key, exists := ztkm.GetKey(ZoneIdLT)
		assert.False(t, exists)
		assert.Nil(t, key)
	})

	t.Run("RemoveKey", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		_, exists := ztkm.GetKey(ZoneIdLT)
		assert.True(t, exists)
		
		ztkm.RemoveKey(ZoneIdLT)
		_, exists = ztkm.GetKey(ZoneIdLT)
		assert.False(t, exists)
	})

	t.Run("Clone", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		keyB := "KeyB"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		ztkm.SetKey(ZoneIdRT, &keyB)
		ztkm.SetKey(ZoneIdLBUp, nil) // nil mapping
		
		cloned := ztkm.Clone()
		
		// Check that the clone has the same content
		key, exists := cloned.GetKey(ZoneIdLT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyA", *key)
		
		key, exists = cloned.GetKey(ZoneIdRT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyB", *key)
		
		key, exists = cloned.GetKey(ZoneIdLBUp)
		assert.True(t, exists)
		assert.Nil(t, key)
		
		// Check that modifying the clone doesn't affect the original
		newKey := "KeyC"
		cloned.SetKey(ZoneIdLT, &newKey)
		
		originalKey, _ := ztkm.GetKey(ZoneIdLT)
		assert.Equal(t, "KeyA", *originalKey)
		
		clonedKey, _ := cloned.GetKey(ZoneIdLT)
		assert.Equal(t, "KeyC", *clonedKey)
	})

	t.Run("Clone_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		cloned := ztkm.Clone()
		assert.NotNil(t, cloned)
		assert.Len(t, cloned, 0)
	})

	t.Run("GetMappedZones", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		ztkm.SetKey(ZoneIdRT, nil)
		
		zones := ztkm.GetMappedZones()
		assert.Len(t, zones, 2)
		assert.Contains(t, zones, ZoneIdLT)
		assert.Contains(t, zones, ZoneIdRT)
	})

	t.Run("GetMappedZones_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		zones := ztkm.GetMappedZones()
		assert.Nil(t, zones)
	})

	t.Run("GetActiveZones", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		ztkm.SetKey(ZoneIdRT, nil) // This should not be included in active zones
		
		zones := ztkm.GetActiveZones()
		assert.Len(t, zones, 1)
		assert.Contains(t, zones, ZoneIdLT)
		assert.NotContains(t, zones, ZoneIdRT)
	})

	t.Run("GetActiveZones_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		zones := ztkm.GetActiveZones()
		assert.Nil(t, zones)
	})

	t.Run("Validate", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		err := ztkm.Validate()
		assert.NoError(t, err)
	})

	t.Run("Validate_InvalidZone", func(t *testing.T) {
		ztkm := ZoneToKeyMapping{
			ZoneId("invalid"): nil,
		}
		
		err := ztkm.Validate()
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "invalid zone ID")
	})

	t.Run("Validate_NilMapping", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		err := ztkm.Validate()
		assert.NoError(t, err)
	})
}

func TestZoneToKeyMappingScan(t *testing.T) {
	t.Run("ScanBytes", func(t *testing.T) {
		jsonData := `{"lt":"KeyA","rt":"KeyB","lbUp":null}`
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan([]byte(jsonData))
		require.NoError(t, err)
		
		key, exists := ztkm.GetKey(ZoneIdLT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyA", *key)
		
		key, exists = ztkm.GetKey(ZoneIdRT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyB", *key)
		
		key, exists = ztkm.GetKey(ZoneIdLBUp)
		assert.True(t, exists)
		assert.Nil(t, key)
	})

	t.Run("ScanString", func(t *testing.T) {
		jsonData := `{"lt":"KeyA","rt":"KeyB"}`
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan(jsonData)
		require.NoError(t, err)
		
		key, exists := ztkm.GetKey(ZoneIdLT)
		assert.True(t, exists)
		assert.NotNil(t, key)
		assert.Equal(t, "KeyA", *key)
	})

	t.Run("ScanNil", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan(nil)
		require.NoError(t, err)
		assert.NotNil(t, ztkm)
		assert.Len(t, ztkm, 0)
	})

	t.Run("ScanEmptyJSON", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan([]byte(`{}`))
		require.NoError(t, err)
		assert.NotNil(t, ztkm)
		assert.Len(t, ztkm, 0)
	})

	t.Run("ScanInvalidJSON", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan([]byte(`{`))
		require.Error(t, err)
		assert.ErrorAs(t, err, new(*json.SyntaxError))
	})

	t.Run("ScanIncompatibleType", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		err := ztkm.Scan(123)
		require.Error(t, err)
		assert.EqualError(t, err, "incompatible type for ZoneToKeyMapping")
	})
}

func TestZoneToKeyMappingValue(t *testing.T) {
	t.Run("Value", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		keyA := "KeyA"
		keyB := "KeyB"
		
		ztkm.SetKey(ZoneIdLT, &keyA)
		ztkm.SetKey(ZoneIdRT, &keyB)
		ztkm.SetKey(ZoneIdLBUp, nil)
		
		value, err := ztkm.Value()
		require.NoError(t, err)
		
		// Parse the JSON to verify structure
		var parsed map[string]*string
		err = json.Unmarshal(value.([]byte), &parsed)
		require.NoError(t, err)
		
		assert.Equal(t, "KeyA", *parsed["lt"])
		assert.Equal(t, "KeyB", *parsed["rt"])
		assert.Nil(t, parsed["lbUp"])
	})

	t.Run("Value_Empty", func(t *testing.T) {
		ztkm := make(ZoneToKeyMapping)
		
		value, err := ztkm.Value()
		require.NoError(t, err)
		assert.Equal(t, `{}`, string(value.([]byte)))
	})

	t.Run("Value_Nil", func(t *testing.T) {
		var ztkm ZoneToKeyMapping
		
		value, err := ztkm.Value()
		require.NoError(t, err)
		assert.Nil(t, value)
	})
}