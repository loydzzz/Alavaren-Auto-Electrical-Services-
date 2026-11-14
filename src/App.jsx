import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import CustomerHome from './pages/customer/Home'
import CustomerBooking from './pages/customer/Booking'
import MyAppointments from './pages/customer/MyAppointments'


import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminInventory from './pages/admin/Inventory'
import AdminAppointments from './pages/admin/Appointments'
import Archive from './pages/admin/Archive'

import Transactions from './pages/admin/Transactions.jsx'
import CreateTransaction from './pages/admin/CreateTransaction.jsx'

import Profile from './pages/admin/Profile.jsx'

import Announcements from './pages/admin/Announcements.jsx'

import WarrantyCertificate from './pages/admin/WarrantyCertificate.jsx'
import HomeServiceWarrantyCertificate from './pages/admin/HomeServiceWarranty.jsx'


import TechnicianInventory from './pages/technician/TechnicianInventory.jsx'

import CustomerModeration from './pages/admin/CustomerModeration'







import TechnicianTasks from './pages/technician/Tasks.jsx'

import Landing from './pages/Landing page/Landing.jsx'
import DashboardLayout from './layouts/DashboardLayout'
import ChooseRole from './pages/ChooseRole'




  

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/choose-role" element={<ChooseRole />} />

        <Route path="/login/:role" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register/:role" element={<Register />} />
        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* CUSTOMER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
  <Route path="/customer" element={<DashboardLayout />}>
    <Route index element={<CustomerHome />} />
    <Route path="booking" element={<CustomerBooking />} />
    <Route path="appointments" element={<MyAppointments />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Route>


        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/admin" element={<DashboardLayout />}>

    <Route index element={<AdminDashboard />} />

    <Route path="profile" element={<Profile />} />


    {/* ADD THESE MISSING ROUTES */}
    <Route path="inventory" element={<AdminInventory />} />
    <Route path="tasks" element={<TechnicianTasks />} />
    <Route path="appointments" element={<AdminAppointments />} />
    <Route path="archive" element={<Archive />} />
   
    <Route path="transactions" element={<Transactions />} />

<Route
  path="transactions/create/:appointmentId"
  element={<CreateTransaction />}
/>

<Route
  path="customers"
  element={<CustomerModeration />}
/>

<Route
  path="announcements"
  element={<Announcements />}
/>

<Route path="booking" element={<CustomerBooking />} />


{/* ==========================================
      WARRANTY POLICY
  ========================================== */}

  <Route
    path="warranty"
    element={<WarrantyCertificate />}
  />

{/* ==========================================
    HOME SERVICE WARRANTY
========================================== */}

<Route
  path="home-service-warranty"
  element={<HomeServiceWarrantyCertificate />}
/>


    </Route>
  </Route>

        {/* TECHNICIAN ROUTES */}
       {/* TECHNICIAN ROUTES */}
<Route element={<ProtectedRoute allowedRoles={['technician']} />}>
  <Route path="/technician" element={<DashboardLayout />}>

    <Route index element={<TechnicianTasks />} />

    <Route path="tasks" element={<TechnicianTasks />} />

    <Route path="profile" element={<Profile />} />

    <Route
  path="/technician/inventory"
  element={<TechnicianInventory />}
/>


  </Route>
</Route>

      </Routes>
    </BrowserRouter>
  )
}