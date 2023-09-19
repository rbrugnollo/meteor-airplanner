import { IconType } from 'react-icons';
import {
  FaHouse,
  FaPlane,
  FaUsers,
  FaCalendarDays,
  FaGear,
  FaMoneyBillTransfer,
} from 'react-icons/fa6';
import { CiAirportSign1 } from 'react-icons/ci';
import { AirplaneListRoles } from '/imports/ui/pages/airplanes/AirplaneList';
import { UserListRoles } from '/imports/ui/pages/users/UserList';
import { CostCenterListRoles } from '/imports/ui/pages/costCenters/CostCenterList';
import { AirportListRoles } from '/imports/ui/pages/airports/AirportList';
import { FlightScheduleListRoles } from '/imports/ui/pages/flightSchedule/FlightScheduleList';

export interface Link {
  label: string;
  href: string;
  Icon: IconType;
  roles?: string[];
  end: boolean;
}

const links: Link[] = [
  { label: 'Home', Icon: FaHouse, href: '/app', end: true },
  {
    label: 'Flight Schedule',
    Icon: FaCalendarDays,
    href: 'flightSchedule',
    roles: FlightScheduleListRoles,
    end: false,
  },
  {
    label: 'Airplanes',
    Icon: FaPlane,
    href: 'airplanes',
    roles: AirplaneListRoles,
    end: false,
  },
  {
    label: 'Airports',
    Icon: CiAirportSign1,
    href: 'airports',
    roles: AirportListRoles,
    end: false,
  },
  { label: 'Users', Icon: FaUsers, href: 'users', roles: UserListRoles, end: false },
  {
    label: 'Cost Centers',
    Icon: FaMoneyBillTransfer,
    href: 'costCenters',
    roles: CostCenterListRoles,
    end: false,
  },
  { label: 'Settings', Icon: FaGear, href: 'settings', end: false },
];

export default links;
