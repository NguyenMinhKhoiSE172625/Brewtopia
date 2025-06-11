// Utility functions for handling address data

export interface AddressObject {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  coordinates?: [number, number];
}

export type AddressType = string | AddressObject;

/**
 * Format address object to display string
 */
export const formatAddressToString = (address: AddressType): string => {
  if (typeof address === 'string') {
    return address;
  }
  
  if (address && typeof address === 'object') {
    const addressParts = [
      address.street,
      address.ward,
      address.district,
      address.city
    ].filter(Boolean);
    
    return addressParts.join(', ');
  }
  
  return '';
};

/**
 * Parse address string to object (basic implementation)
 */
export const parseAddressString = (addressString: string): AddressObject => {
  const parts = addressString.split(', ').map(part => part.trim());
  
  return {
    street: parts[0] || undefined,
    ward: parts[1] || undefined,
    district: parts[2] || undefined,
    city: parts[3] || undefined,
    coordinates: [0, 0] as [number, number]
  };
};

/**
 * Create address object with coordinates
 */
export const createAddressObject = (
  street: string,
  ward?: string,
  district?: string,
  city?: string,
  coordinates?: [number, number]
): AddressObject => {
  const addressObj: AddressObject = {
    street: street || undefined,
    ward: ward || undefined,
    district: district || undefined,
    city: city || undefined,
  };

  // Only add coordinates if provided and not [0, 0]
  if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
    addressObj.coordinates = coordinates;
  }

  return addressObj;
};

/**
 * Check if address has valid coordinates
 */
export const hasValidCoordinates = (address: AddressType): boolean => {
  if (typeof address === 'string') {
    return false;
  }
  
  if (address && typeof address === 'object' && address.coordinates) {
    const [lat, lng] = address.coordinates;
    return lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng);
  }
  
  return false;
};

/**
 * Get coordinates from address
 */
export const getCoordinatesFromAddress = (address: AddressType): [number, number] | null => {
  if (typeof address === 'string') {
    return null;
  }

  if (address && typeof address === 'object' && address.coordinates) {
    return address.coordinates;
  }

  return null;
};

/**
 * Convert coordinates to GeoJSON format for MongoDB
 */
export const createGeoJSONPoint = (latitude: number, longitude: number) => {
  return {
    type: 'Point',
    coordinates: [longitude, latitude] // GeoJSON uses [lng, lat] order
  };
};

/**
 * Create address object with GeoJSON coordinates
 */
export const createAddressObjectWithGeoJSON = (
  street: string,
  ward?: string,
  district?: string,
  city?: string,
  coordinates?: [number, number]
): AddressObject & { location?: any } => {
  const addressObj: any = {
    street: street || undefined,
    ward: ward || undefined,
    district: district || undefined,
    city: city || undefined,
  };

  // Add GeoJSON location if coordinates provided
  if (coordinates && coordinates[0] !== 0 && coordinates[1] !== 0) {
    addressObj.location = createGeoJSONPoint(coordinates[0], coordinates[1]);
  }

  return addressObj;
};
