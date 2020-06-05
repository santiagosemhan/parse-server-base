import { MapsController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  distanceCalculate: {
    action: MapsController.distanceCalculate,
    secure: false,
  },
  getAddress: {
    action: MapsController.getAddressFromLatLng,
    secure: true,
  },
  geocodeAddress: {
    action: MapsController.geocodeAddress,
    secure: true,
  },
  getAddressList: {
    action: MapsController.getAddressList,
    secure: true,
  },
};

export default definitions;
