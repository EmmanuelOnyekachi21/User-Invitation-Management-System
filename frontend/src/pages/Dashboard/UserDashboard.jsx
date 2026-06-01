import Navbar from '../../components/Navbar'

const UserDashboard = () => (
  <div className="min-vh-100 bg-light">
    <Navbar />
    <div className="container mt-5">
      <h5 className="mb-2">Welcome</h5>
      <p className="text-muted">You're logged in. Your account is active.</p>
    </div>
  </div>
)

export default UserDashboard
