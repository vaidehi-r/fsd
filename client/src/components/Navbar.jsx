import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiBell, HiChevronDown, HiLogout, HiUser, HiCog } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';
import useAuthStore from '../stores/authStore';
import useNotificationStore from '../stores/notificationStore';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!isAuthenticated) return [
      { to: '/', label: 'Home' },
      { to: '/cars', label: 'Browse Cars' },
      { to: '/owner/apply', label: 'List Your Car' },
    ];
    if (user?.role === 'admin') return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Users' },
      { to: '/admin/owners', label: 'Owners' },
      { to: '/admin/owner-requests', label: 'Requests' },
      { to: '/admin/cars', label: 'Cars' },
      { to: '/admin/bookings', label: 'Bookings' },
    ];
    if (user?.role === 'owner') return [
      { to: '/owner/dashboard', label: 'Dashboard' },
      { to: '/owner/cars', label: 'My Cars' },
      { to: '/owner/bookings', label: 'Bookings' },
      { to: '/cars', label: 'Browse' },
    ];
    return [
      { to: '/', label: 'Home' },
      { to: '/cars', label: 'Browse Cars' },
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/bookings', label: 'Bookings' },
    ];
  };

  const getProfileLinks = () => {
    if (user?.role === 'admin') return [
      { to: '/admin/settings', label: 'Settings', icon: HiCog },
    ];
    if (user?.role === 'owner') return [
      { to: '/owner/profile', label: 'Profile', icon: HiUser },
    ];
    return [
      { to: '/profile', label: 'Profile', icon: HiUser },
      { to: '/wishlist', label: 'Wishlist', icon: FaCar },
    ];
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-700 to-primary-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <FaCar className="text-white text-lg" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-2xl font-black tracking-tighter uppercase text-slate-800 leading-none">
                Moto<span className="text-primary-600">Lease</span>
              </span>
              <span className="text-[0.55rem] font-bold tracking-[0.25em] text-slate-400 uppercase leading-none mt-0.5 ml-0.5">
                Premium Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {getNavLinks().map((link) => (
              <Link key={link.to} to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-200">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-slate-500 hover:text-primary-700 hover:bg-primary-50 transition-all">
                    <HiBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-slow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center overflow-hidden">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user?.name}</span>
                    <HiChevronDown className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">{user?.role}</span>
                      </div>
                      {getProfileLinks().map((link) => (
                        <Link key={link.to} to={link.to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-gray-50 hover:text-primary-700 transition-colors">
                          <link.icon className="text-lg" />
                          {link.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <HiLogout className="text-lg" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-700 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100">
            {mobileOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700">
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block text-center py-2.5 text-sm font-medium text-primary-700">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="block text-center btn-primary text-sm">Get Started</Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="pt-3 border-t border-gray-100">
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600">
                  <HiLogout /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
