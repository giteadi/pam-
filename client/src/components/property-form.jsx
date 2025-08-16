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
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 modal-overlay">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-serif font-bold text-foreground">
            {property ? "Edit Property" : "Add New Property"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-card-foreground">
                Property Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter property name"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive modal-content">{errors.name}</p>}
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-card-foreground">
                Property Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50"
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
            <label htmlFor="address" className="text-sm font-medium text-card-foreground">
              Address *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                errors.address ? "border-destructive" : "border-border"
              }`}
              placeholder="Enter full address"
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-sm text-destructive modal-content">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Units */}
            <div className="space-y-2">
              <label htmlFor="units" className="text-sm font-medium text-card-foreground">
                Number of Units *
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                  errors.units ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter number of units"
                disabled={isSubmitting}
              />
              {errors.units && <p className="text-sm text-destructive modal-content">{errors.units}</p>}
            </div>

            {/* Next Inspection */}
            <div className="space-y-2">
              <label htmlFor="nextInspection" className="text-sm font-medium text-card-foreground">
                Next Inspection Date *
              </label>
              <input
                id="nextInspection"
                name="nextInspection"
                type="date"
                value={formData.nextInspection}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                  errors.nextInspection ? "border-destructive" : "border-border"
                }`}
                disabled={isSubmitting}
              />
              {errors.nextInspection && (
                <p className="text-sm text-destructive modal-content">{errors.nextInspection}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner */}
            <div className="space-y-2">
              <label htmlFor="owner" className="text-sm font-medium text-card-foreground">
                Owner/Management Company *
              </label>
              <input
                id="owner"
                name="owner"
                type="text"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                  errors.owner ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter owner name"
                disabled={isSubmitting}
              />
              {errors.owner && <p className="text-sm text-destructive modal-content">{errors.owner}</p>}
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label htmlFor="contact" className="text-sm font-medium text-card-foreground">
                Contact Email *
              </label>
              <input
                id="contact"
                name="contact"
                type="email"
                value={formData.contact}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-input border rounded-lg focus-ring transition-all duration-200 hover:border-primary/50 ${
                  errors.contact ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter contact email"
                disabled={isSubmitting}
              />
              {errors.contact && <p className="text-sm text-destructive modal-content">{errors.contact}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-muted-foreground hover:text-foreground border border-border hover:bg-muted rounded-lg transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full spinner"></div>
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
