import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ Ensure axios is imported
import { COLORS } from "./constants";

import FeedScreen from "./screens/app/FeedScreen";
import DiscoverScreen from "./screens/app/DiscoverScreen";
import EventsScreen from "./screens/app/EventsScreen";
import ChatScreen from "./screens/app/ChatScreen";
import ProfileScreen from "./screens/app/ProfileScreen";

import WelcomeAuthScreen from "./screens/auth/WelcomeAuthScreen";
import SignupIdentityScreen from "./screens/auth/SignupIdentityScreen";
import SignupWorkLocationScreen from "./screens/auth/SignupWorkLocationScreen";
import SignupInterestsScreen from "./screens/auth/SignupInterestsScreen";
import BackgroundImage from './images/background_img.png';
import Avatar from "../src/components/Avatar";
import avatarDinosaur from './images/avatarDinosaur.png';
import { fetchMyProfile } from "./services/profileService";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
/* -------------------- BOTTOM NAV -------------------- */

const NAV_ITEMS = [
  { id: "feed", emoji: "🏠", label: "Feed" },
  { id: "discover", emoji: "🔍", label: "Discover" },
  { id: "events", emoji: "📅", label: "Events" },
  { id: "chat", emoji: "💬", label: "Chat" },
  { id: "profile", emoji: "👤", label: "Profile" },
];

function BottomNav({ tab, setTab }) {
  return (
    // <div style={{ display: "flex", borderTop: `1.5px solid ${COLORS.border}`, background: "white", flexShrink: 0 }}>
    // bharti changes

    <div
      style={{
        display: "flex",
        borderTop: `1.5px solid ${COLORS.border}`,
        //background: "#0c0c0c",
        backgroundImage: `url(${BackgroundImage})`,
        flexShrink: 0,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            // style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}

            //bharti changes 

            style={{
              flex: 1,
              border: "none",
              background: "linear-gradient(135deg, rgb(108, 99, 255), rgb(255, 101, 132)) text",
              cursor: "pointer",
              padding: "10px 0 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.emoji}</span>

            <span
              style={{
                fontSize: 13,
                fontWeight: active ? 800 : 500,
                color: active ? '#fffff' : '#f5b8da',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {item.label}
            </span>
            {/* {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.primary }} />} */}

            {active && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: '#fffff',
                  fontSize: 13,
                  color: '#fffff'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------- APP ROOT -------------------- */

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("feed");
  const [myInterests, setMyInterests] = useState(["Cricket", "Gaming", "Movies"]);
  // At the top of App.js component function alongside your other states:
   const [showCompose, setShowCompose] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  // Fetch live profilePicture from DB whenever the user logs in (onboarded becomes true)
  useEffect(() => {
    if (!onboarded) return;
    fetchMyProfile()
      .then(res => {
        const pic = res.data?.data?.profilePicture || null;
        setProfilePic(pic);
      })
      .catch(() => {});
  }, [onboarded]);

  const [authStep, setAuthStep] = useState(0);
  const [empId, setEmpId] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [department, setDepartment] = useState("");
  const [location,   setLocation]   = useState(""); 
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [error, setError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleIdentityNext = () => {
    console.log("[DEBUG]", { empId, fullName, password, confirmPassword });
    setError("");
    if (!empId) { setError("ID_EMPTY"); return; }
    if (!/^E\d{4}$/.test(empId)) { setError("ID_FORMAT_INVALID"); return; }
    if (!fullName) { setError("NAME_EMPTY"); return; }
    if (!password) { setError("PASSWORD_EMPTY"); return; }
    if (password.length < 6) { setError("PASSWORD_TOO_SHORT"); return; }
    if (!/^[A-Z]/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
    if (!/\d/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
    if (!/@/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
    if (password !== confirmPassword) { setError("PASSWORD_MISMATCH"); return; }
    console.log("[DEBUG] All validations passed, setting authStep to 2");
    setAuthStep(2);
    console.log("[DEBUG] setAuthStep(2) called");
  };

  const handleWorkLocationNext = () => {
    setError("");
    if (!department) { setError("DEPT_EMPTY");     return; }
    if (!location)   { setError("LOCATION_EMPTY"); return; }  // ADD THIS LINE
    if (!building)   { setError("BUILDING_EMPTY"); return; }
    if (!floor)      { setError("FLOOR_EMPTY");    return; }
    setAuthStep(3);
};

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";
    document.head.appendChild(link);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link2);
  }, []);

  const renderTab = () => {
    switch (tab) {
      case "feed": return <FeedScreen myInterests={myInterests} profilePic={profilePic} />;
      case "discover": return <DiscoverScreen myInterests={myInterests} setMyInterests={setMyInterests} />;
      case "events": return <EventsScreen />;
      case "chat": return <ChatScreen profilePic={profilePic} />;
      case "profile": return <ProfileScreen myInterests={myInterests} setMyInterests={setMyInterests} profilePic={profilePic} setProfilePic={setProfilePic} onLogout={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setProfilePic(null);
        setOnboarded(false);
        setAuthStep(0);
        setTab("feed");
      }} />;
      default: return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#E8EAF6",
        padding: "20px 0",
      }}
    >
      {/* Phone shell */}
      <div
        style={{
          width: 390,
          height: 780,
          borderRadius: 44,
          backgroundImage: `url(${BackgroundImage})`,

          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow:
            "0 30px 80px rgba(108,99,255,0.22), 0 10px 30px rgba(0,0,0,0.12)",
          border: "8px solid #1A1A2E",
          position: "relative",
        }}
      >
        {/*top header
       Notch */}
        <div
          style={{
            height: 6,
            backgroundImage: `url(${BackgroundImage})`,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 110,
              height: 20,
              borderRadius: 12,
              background: "#0D0D1A",
            }}
          />
        </div>


        {/* App bar */}

        {onboarded && (
          // <div style={{ background: "white", padding: "10px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0 }}>
          // <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          <div
            style={{
              // background: "#0c0c0c",
              backgroundImage: `url(${BackgroundImage})`,
              padding: "10px 20px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              // borderBottom: `1.5px solid ${COLORS.border}`,
              flexShrink: 0,
              display: "flex",
            }}
          >
            <div
              style={{
                backgroundImage: `url(${BackgroundImage})`,
              }}>
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontWeight: 800,
                  fontSize: 25,
                  // background: `linear-gradient(135deg, #ed46c9, #35ffff) text`,
                  background: "linear-gradient(135deg, #f99cf2, rgb(190 247 231)) text",
                  letterSpacing: '0.6px',
                  // WebkitBackgroundClip: "text",
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ConnectSphere
              </div>
              {/* Tagline */}
  <div
    style={{
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      fontSize: 12,
      // color: "rgba(233, 241, 241, 1)", // Semi-transparent white to match your cosmic theme
      color: "rgba(245, 246, 246, 1)", 
      letterSpacing: "1px",
      marginTop: "2px", // Slight spacing below the title
      textTransform: "uppercase", // Gives it a clean, modern look
    }}
  >
    Connect. Share. Belong
  </div>
            </div>
            <Avatar 
             alt='VK'
            // alt={currentUser?.avatar || '??'}
            color={'#a7aebf'}
             online 
             backgroundColor='white'
             image={profilePic || avatarDinosaur}
            // image={currentUser?.profilePicture || null}
              />
          </div>
        )}

        {/* <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}> */}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {!onboarded ? (
            <>
              {authStep === 0 && (
                <WelcomeAuthScreen
                  error={loginError}
                  onNext={() => setAuthStep(1)}
                  onLogin={(data) => {
                    if (data?.success) {
                      localStorage.setItem("token", data.data.token);
                      localStorage.setItem("user", JSON.stringify(data.data.user));
                      if (data.data.user?.interests) {
                        setMyInterests(data.data.user.interests);
                      }
                      setOnboarded(true);
                    } else {
                      setLoginError("INVALID_CREDENTIALS");
                    }
                  }}
                />
              )}

              {authStep === 1 && (
                <SignupIdentityScreen
                  empId={empId} setEmpId={setEmpId}
                  fullName={fullName} setFullName={setFullName}
                  password={password} setPassword={setPassword}
                  confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
                  error={error}
                  isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous}
                  onNext={handleIdentityNext}
                  onBack={() => setAuthStep(0)}
                />
              )}

              {authStep === 2 && (
                
              <SignupWorkLocationScreen
    department={department} setDepartment={setDepartment}
    location={location}     setLocation={setLocation}       // ADD THIS LINE
    building={building}     setBuilding={setBuilding}
    floor={floor}           setFloor={setFloor}
    error={error}
    onNext={handleWorkLocationNext}
    onBack={() => setAuthStep(1)}
/>)}

              {authStep === 3 && (
                <SignupInterestsScreen
                  interests={selectedInterests}
                  setInterests={setSelectedInterests}
                  identityData={{ empId, fullName, password, isAnonymous, department, location,building, floor }}
                  onSubmit={(data) => {
                    // After successful registration the backend now returns a token
                    // (just like login does). Persist token + user so every
                    // subsequent API call has auth, then jump into the app.
                    if (data?.success) {
                      localStorage.setItem("token", data.data.token);
                      localStorage.setItem("user", JSON.stringify(data.data.user));
                      if (data.data.user?.interests) {
                        setMyInterests(data.data.user.interests);
                      }
                    } else {
                      // Fallback to whatever the user just picked on the tile grid
                      // — covers the (unlikely) case where the response shape is missing.
                      setMyInterests(selectedInterests.length ? selectedInterests : myInterests);
                    }
                    setOnboarded(true);
                  }}
                  onBack={() => setAuthStep(2)}
                />
              )}
            </>
          ) : (
            <>
              {/* <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}> */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {renderTab()}
              </div>
              <BottomNav tab={tab} setTab={setTab} />
            </>
          )}
        </div>
      </div>
    </div >
    </LocalizationProvider>
  );
}