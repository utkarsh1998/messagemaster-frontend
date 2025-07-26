import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Layout.css";
import NotificationBell from "./NotificationBell";
import axios from "axios";

// --- Helper Functions ---

// Gets the authorization token from local storage for API requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// --- Navigation Links Configuration ---

const navLinksConfig = {
    Admin: [
      { path: "/admin", label: "Dashboard", icon: "🏠" },
      { path: "/profile/:userId", label: "My Profile", icon: "👤" },
      { path: "/users", label: "Users", icon: "👥" },
      { path: "/campaigns", label: "Campaigns", icon: "📤" },
      { path: "/credits", label: "Credits", icon: "💳" },
      { path: "/reports", label: "Reports", icon: "📊" },
      { path: "/history", label: "History", icon: "📋" },
      { path: "/analytics", label: "Analytics", icon: "📈" },
      { path: "/tickets", label: "Support Tickets", icon: "🎫" },
      { path: "/admin-announcements", label: "Manage Announcements", icon: "⚙️" },
      { path: "/announcements-history", label: "View Announcements", icon: "📢" },
      { path: "/backup", label: "Backup & Data", icon: "🗄️" },
    ],
    Reseller: [
      { path: "/reseller-dashboard", label: "Dashboard", icon: "🏠" },
      { path: "/profile/:userId", label: "My Profile", icon: "👤" },
      { path: "/users", label: "My Users", icon: "👥" },
      { path: "/campaigns", label: "Campaigns", icon: "📤" },
      { path: "/history", label: "History", icon: "📋" },
      { path: "/analytics", label: "Analytics", icon: "📈" },
      { path: "/tickets", label: "Support Tickets", icon: "🎫" },
      { path: "/announcements-history", label: "Announcements", icon: "📢" },
      { path: "/whitelabel-settings", label: "Whitelabel", icon: "🎨" },
    ],
    "Sub-Reseller": [
      { path: "/subreseller-dashboard", label: "Dashboard", icon: "🏠" },
      { path: "/profile/:userId", label: "My Profile", icon: "👤" },
      { path: "/users", label: "My Users", icon: "👥" },
      { path: "/campaigns", label: "Campaigns", icon: "📤" },
      { path: "/tickets", label: "Support Tickets", icon: "🎫" },
      { path: "/announcements-history", label: "Announcements", icon: "📢" },
      { path: "/whitelabel-settings", label: "Whitelabel", icon: "🎨" },
    ],
    User: [
      { path: "/user-dashboard", label: "Dashboard", icon: "🏠" },
      { path: "/profile/:userId", label: "My Profile", icon: "👤" },
      { path: "/campaigns", label: "My Campaigns", icon: "📤" },
      { path: "/tickets", label: "Support Tickets", icon: "🎫" },
      { path: "/announcements-history", label: "Announcements", icon: "📢" },
    ],
};


// --- Sub-Components ---

// Sidebar Component: Renders the branding, user info, navigation, and logout button.
const Sidebar = ({ user, branding, brandingLoading, navLinks, onLogout }) => {
    const location = useLocation();
    const [logoError, setLogoError] = useState(false);

    // Reset logo error state if the logo URL changes
    useEffect(() => {
        setLogoError(false);
    }, [branding.companyLogo]);

    const renderBranding = () => {
        if (brandingLoading) {
            return <div className="mb-4" style={{ height: '50px', backgroundColor: '#3a3f44', borderRadius: '5px' }}></div>;
        }
        if (branding.companyLogo && !logoError) {
            return (
                <img 
                    src={`https://messagemaster-backend.onrender.com${branding.companyLogo}`} 
                    alt={branding.companyName} 
                    className="mb-4" 
                    style={{ maxHeight: '50px', width: 'auto' }} 
                    onError={() => setLogoError(true)} // Fallback to text if image fails
                />
            );
        }
        return <h2 className="mb-4">{branding.companyName}</h2>;
    };

    return (
        <aside style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div>
                {renderBranding()}
                <p style={{ fontSize: "14px", color: "#bbb", marginBottom: "0.5rem" }}>
                    Welcome, <strong>{user?.name || "User"}</strong>
                </p>
                {user?.createdAt && (
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "0", marginBottom: "2rem" }}>
                        Member since: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                )}
            </div>
            
            <nav style={{ flexGrow: 1, overflowY: 'auto' }}>
                <ul>
                    {navLinks.map((link) => {
                        const path = link.path.includes(':userId') ? `/profile/${user.id}` : link.path;
                        return (
                            <li key={path}>
                                <Link
                                    to={path}
                                    className={location.pathname === path ? "active-link" : ""}
                                    aria-label={link.label} // Accessibility improvement
                                >
                                    {`${link.icon} ${link.label}`}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button onClick={onLogout} className="logout-button">
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
};

// Main Content Component: Renders the header with notifications and the main page content.
const MainContent = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0.5rem 2rem',
            background: '#ffffff',
            borderBottom: '1px solid #dee2e6',
            height: '60px'
        }}>
            <NotificationBell />
        </header>
        <main style={{ flex: 1, overflowY: 'auto' }}>
            <Outlet />
        </main>
    </div>
);


// --- Main Layout Component ---

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State Management ---
  const [user, setUser] = useState(null);
  const [branding, setBranding] = useState({
    companyName: 'MessageMaster',
    companyLogo: ''
  });
  const [brandingLoading, setBrandingLoading] = useState(true); // State for smooth loading

  // --- Data Fetching ---
  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem("user") || "null");
    setUser(userFromStorage);

    const fetchBranding = async () => {
        setBrandingLoading(true); // Start loading
        try {
            const config = getAuthHeaders();
            if (config.headers) {
                const { data } = await axios.get('https://messagemaster-backend.onrender.com/api/whitelabel/my-branding', config);
                setBranding(data);
            }
        } catch (error) {
            console.error("Could not fetch branding, using default.");
            setBranding({ companyName: 'MessageMaster', companyLogo: '' });
        } finally {
            setBrandingLoading(false); // End loading
        }
    };
    
    fetchBranding();
  }, [location]);

  // --- Event Handlers ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const accessibleLinks = user ? navLinksConfig[user.role] || [] : [];

  // --- Render ---
  return (
    <div className="layout-container">
      <Sidebar 
        user={user} 
        branding={branding} 
        brandingLoading={brandingLoading} // Pass loading state down
        navLinks={accessibleLinks} 
        onLogout={handleLogout} 
      />
      <MainContent />
    </div>
  );
};

export default Layout;
