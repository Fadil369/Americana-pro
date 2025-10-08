import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Next.js
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface OperationsMapInnerProps {
  filter: string
  locale?: string
}

// Custom icons for different marker types
const createCustomIcon = (type: string, color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <text x="12.5" y="17" text-anchor="middle" font-size="8" fill="${color}">${type}</text>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const vehicleIcon = createCustomIcon('🚛', '#3b82f6')
const outletIcon = createCustomIcon('🏪', '#10b981')
const deliveryIcon = createCustomIcon('📦', '#f59e0b')

export default function OperationsMapInner({ filter, locale }: OperationsMapInnerProps) {
  const [markers, setMarkers] = useState<any[]>([])

  // Riyadh coordinates
  const center: [number, number] = [24.7136, 46.6753]

  const t = {
    ar: {
      vehicle: 'مركبة',
      outlet: 'منفذ',
      delivery: 'توصيل',
      status: 'الحالة',
      active: 'نشط',
      enRoute: 'في الطريق',
      delivered: 'تم التوصيل'
    },
    en: {
      vehicle: 'Vehicle',
      outlet: 'Outlet',
      delivery: 'Delivery',
      status: 'Status',
      active: 'Active',
      enRoute: 'En Route',
      delivered: 'Delivered'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  useEffect(() => {
    // Generate mock data for Riyadh area
    const generateMarkers = () => {
      const newMarkers = []

      // Vehicles
      if (filter === 'all' || filter === 'vehicles') {
        for (let i = 0; i < 24; i++) {
          newMarkers.push({
            id: `vehicle-${i}`,
            type: 'vehicle',
            position: [
              center[0] + (Math.random() - 0.5) * 0.2,
              center[1] + (Math.random() - 0.5) * 0.2
            ] as [number, number],
            title: `${text.vehicle} ${i + 1}`,
            status: Math.random() > 0.5 ? text.active : text.enRoute,
            icon: vehicleIcon
          })
        }
      }

      // Outlets
      if (filter === 'all' || filter === 'outlets') {
        for (let i = 0; i < 50; i++) {
          newMarkers.push({
            id: `outlet-${i}`,
            type: 'outlet',
            position: [
              center[0] + (Math.random() - 0.5) * 0.3,
              center[1] + (Math.random() - 0.5) * 0.3
            ] as [number, number],
            title: `${text.outlet} ${i + 1}`,
            status: text.active,
            icon: outletIcon
          })
        }
      }

      // Deliveries
      if (filter === 'all' || filter === 'deliveries') {
        for (let i = 0; i < 89; i++) {
          newMarkers.push({
            id: `delivery-${i}`,
            type: 'delivery',
            position: [
              center[0] + (Math.random() - 0.5) * 0.25,
              center[1] + (Math.random() - 0.5) * 0.25
            ] as [number, number],
            title: `${text.delivery} ${i + 1}`,
            status: Math.random() > 0.3 ? text.delivered : text.enRoute,
            icon: deliveryIcon
          })
        }
      }

      setMarkers(newMarkers)
    }

    generateMarkers()
  }, [filter, locale])

  // Component to handle map updates
  function MapUpdater() {
    const map = useMap()
    
    useEffect(() => {
      // Fit bounds to show all markers
      if (markers.length > 0) {
        const group = new (window as any).L.featureGroup(
          markers.map(marker => new (window as any).L.marker(marker.position))
        )
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }, [markers, map])

    return null
  }

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <MapUpdater />
      
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={marker.icon}
        >
          <Popup>
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-2">{marker.title}</h4>
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm text-gray-600">{text.status}:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  marker.status === text.active 
                    ? 'bg-green-100 text-green-800'
                    : marker.status === text.enRoute
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {marker.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
