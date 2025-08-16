"use client"

import { useState, useEffect } from "react"

export default function PropertyForm({ property, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "Residential",
    units: "",
    owner: "",
    contact: "",
    nextInspection: "",
    amenities: [],
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customAmenity, setCustomAmenity] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const predefinedAmenities = [
    "Swimming Pool",
    "Gym/Fitness Center",
    "Parking Garage",
    "Elevator",
    "Laundry Facility",
    "Security System",
    "Air Conditioning",
    "Balcony/Patio",
    "Storage Unit",
    "Pet-Friendly",
    "Playground",
    "Business Center",
  ]

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        address: property.address || "",
        type: property.type || "Residential",
        units: property.units || "",
        owner: property.owner || "",
        contact: property.contact || "",
        nextInspection: property.nextInspection || "",
        amenities: property.amenities || [],
      })
    }
  }, [property])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Property name is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.units || formData.units < 1) newErrors.units = "Units must be at least 1"
    if (!formData.owner.trim()) newErrors.owner = "Owner is required"
    if (!formData.contact.trim()) newErrors.contact = "Contact is required"
    if (!formData.nextInspection) newErrors.nextInspection = "Next inspection date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("[v0] Property form submitted with data:", formData)
    if (validateForm()) {
      setIsSubmitting(true)
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      onSubmit({
        ...formData,
        units: Number.parseInt(formData.units),
      })
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log("[v0] Input change:", name, value) // Added debug logging for input changes
    console.log("[v0] Event target:", e.target)
    console.log("[v0] Current formData before change:", formData)
    setFormData((prev) => ({ ...prev, [name]: value }))
    console.log("[v0] FormData after change should be:", { ...formData, [name]: value })
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const addCustomAmenity = () => {
    console.log("[v0] Adding custom amenity:", customAmenity)
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()],
      }))
      setCustomAmenity("")
      setShowCustomInput(false)
    }
  }

  const removeAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }))
  }

  const handleCustomAmenityChange = (e) => {
    console.log("[v0] Custom amenity input:", e.target.value)
    console.log("[v0] Custom amenity event:", e)
    setCustomAmenity(e.target.value)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{property ? "Edit Property" : "Add New Property"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Property Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter property name"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full address"
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Units */}
            <div className="space-y-2">
              <label htmlFor="units" className="text-sm font-medium text-gray-700">
                Number of Units *
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.units ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter number of units"
                disabled={isSubmitting}
              />
              {errors.units && <p className="text-sm text-red-600">{errors.units}</p>}
            </div>

            {/* Next Inspection */}
            <div className="space-y-2">
              <label htmlFor="nextInspection" className="text-sm font-medium text-gray-700">
                Next Inspection Date *
              </label>
              <input
                id="nextInspection"
                name="nextInspection"
                type="date"
                value={formData.nextInspection}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.nextInspection ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.nextInspection && <p className="text-sm text-red-600">{errors.nextInspection}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner */}
            <div className="space-y-2">
              <label htmlFor="owner" className="text-sm font-medium text-gray-700">
                Owner/Management Company *
              </label>
              <input
                id="owner"
                name="owner"
                type="text"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.owner ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter owner name"
                disabled={isSubmitting}
              />
              {errors.owner && <p className="text-sm text-red-600">{errors.owner}</p>}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium text-gray-700">
                Contact Email *
              </label>
              <input
                id="contact"
                name="contact"
                type="email"
                value={formData.contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.contact ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter contact email"
                disabled={isSubmitting}
              />
              {errors.contact && <p className="text-sm text-red-600">{errors.contact}</p>}
            </div>
          </div>

          {/* Amenities Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Property Amenities</label>

            {/* Predefined Amenities Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>

            {/* Custom Amenities Display */}
            {formData.amenities.filter((a) => !predefinedAmenities.includes(a)).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Custom Amenities:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities
                    .filter((a) => !predefinedAmenities.includes(a))
                    .map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                          disabled={isSubmitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Custom Amenity Input */}
            {showCustomInput ? (
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={customAmenity}
                  onChange={handleCustomAmenityChange}
                  placeholder="Enter custom amenity"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  onKeyPress={(e) => e.key === "Enter" && addCustomAmenity()}
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isSubmitting || !customAmenity.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false)
                    setCustomAmenity("")
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Amenity
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{property ? "Update Property" : "Add Property"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
