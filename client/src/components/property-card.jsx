"use client"

export default function PropertyCard({ property, userRole, onEdit, onView, onDelete }) {
  const getStatusColor = (status) => {
    if (!status) return "bg-muted text-muted-foreground border-border"

    switch (status.toLowerCase()) {
      case "active":
        return "bg-accent/10 text-accent border-accent/20"
      case "pending":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "inactive":
        return "bg-muted text-muted-foreground border-border"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getTypeColor = (type) => {
    if (!type) return "bg-muted text-muted-foreground border-border"

    switch (type.toLowerCase()) {
      case "residential":
        return "bg-primary/10 text-primary border-primary/20"
      case "commercial":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "industrial":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      case "mixed use":
        return "bg-accent/10 text-accent border-accent/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const canEdit = userRole === "admin" || userRole === "supervisor"
  const canDelete = userRole === "admin"

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-serif font-semibold text-foreground mb-1">{property.name}</h3>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(property.type)}`}>
            {property.type}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Units:</span>
          <span className="text-card-foreground">{property.units}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Owner:</span>
          <span className="text-card-foreground truncate ml-2">{property.owner}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Next Inspection:</span>
          <span className="text-card-foreground">{property.nextInspection}</span>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-border">
        <button
          onClick={() => onView(property)}
          className="px-3 py-1 text-sm text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          View
        </button>
        {canEdit && (
          <button
            onClick={() => onEdit(property)}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(property)}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
