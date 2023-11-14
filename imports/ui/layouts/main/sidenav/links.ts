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
import { Permission } from '/imports/api/users/collection';

export interface Link {
  label: string;
  href: string;
  Icon: IconType;
  permission?: Permission;
  end: boolean;
}

const links: Link[] = [
  { label: 'Início', Icon: FaHouse, href: '/app', end: true },
  {
    label: 'Vôos',
    Icon: FaCalendarDays,
    href: 'flights',
    permission: 'flights.list',
    end: false,
  },
  {
    label: 'Aeronaves',
    Icon: FaPlane,
    href: 'airplanes',
    permission: 'airplanes.list',
    end: false,
  },
  {
    label: 'Aeroportos',
    Icon: CiAirportSign1,
    href: 'airports',
    permission: 'airports.list',
    end: false,
  },
  { label: 'Usuários', Icon: FaUsers, href: 'users', permission: 'users.list', end: false },
  {
    label: 'Centros de Custo',
    Icon: FaMoneyBillTransfer,
    href: 'costCenters',
    permission: 'costCenters.list',
    end: false,
  },
  {
    label: 'Agenda',
    Icon: FaCalendarDays,
    href: 'schedule',
    permission: 'schedule.list',
    end: false,
  },
  { label: 'Configurações', Icon: FaGear, href: 'settings', end: false },
];

export default links;
