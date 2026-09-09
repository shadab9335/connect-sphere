// import React, { useState, useEffect } from "react";
// import axios from "axios"; // ✅ Ensure axios is imported
// import { COLORS } from "./constants";

// import FeedScreen from "./screens/app/FeedScreen";
// import DiscoverScreen from "./screens/app/DiscoverScreen";
// import EventsScreen from "./screens/app/EventsScreen";
// import ChatScreen from "./screens/app/ChatScreen";
// import ProfileScreen from "./screens/app/ProfileScreen";

// import WelcomeAuthScreen from "./screens/auth/WelcomeAuthScreen";
// import SignupIdentityScreen from "./screens/auth/SignupIdentityScreen";
// import SignupWorkLocationScreen from "./screens/auth/SignupWorkLocationScreen";
// import SignupInterestsScreen from "./screens/auth/SignupInterestsScreen";
// import BackgroundImage from './images/background_img.png';
// import Avatar from "../src/components/Avatar";
// import avatarDinosaur from './images/avatarDinosaur.png';
// import { fetchMyProfile } from "./services/profileService";

// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// /* -------------------- BOTTOM NAV -------------------- */

// const NAV_ITEMS = [
//   { id: "feed", emoji: "🏠", label: "Feed" },
//   { id: "discover", emoji: "🔍", label: "Discover" },
//   { id: "events", emoji: "📅", label: "Events" },
//   { id: "chat", emoji: "💬", label: "Chat" },
//   { id: "profile", emoji: "👤", label: "Profile" },
// ];

// function BottomNav({ tab, setTab }) {
//   return (
//     // <div style={{ display: "flex", borderTop: `1.5px solid ${COLORS.border}`, background: "white", flexShrink: 0 }}>
//     // bharti changes

//     <div
//       style={{
//         display: "flex",
//         borderTop: `1.5px solid ${COLORS.border}`,
//         //background: "#0c0c0c",
//         backgroundImage: `url(${BackgroundImage})`,
//         flexShrink: 0,
//       }}
//     >
//       {NAV_ITEMS.map((item) => {
//         const active = tab === item.id;
//         return (
//           <button
//             key={item.id}
//             onClick={() => setTab(item.id)}
//             // style={{ flex: 1, border: "none", background: "none", cursor: "pointer", padding: "10px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}

//             //bharti changes 

//             style={{
//               flex: 1,
//               border: "none",
//               background: "linear-gradient(135deg, rgb(108, 99, 255), rgb(255, 101, 132)) text",
//               cursor: "pointer",
//               padding: "10px 0 8px",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               gap: 2,
//             }}
//           >
//             <span style={{ fontSize: 18 }}>{item.emoji}</span>

//             <span
//               style={{
//                 fontSize: 13,
//                 fontWeight: active ? 800 : 500,
//                 color: active ? '#fffff' : '#f5b8da',
//                 fontFamily: "'DM Sans', sans-serif",
//               }}
//             >
//               {item.label}
//             </span>
//             {/* {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.primary }} />} */}

//             {active && (
//               <div
//                 style={{
//                   width: 4,
//                   height: 4,
//                   borderRadius: "50%",
//                   background: '#fffff',
//                   fontSize: 13,
//                   color: '#fffff'
//                 }}
//               />
//             )}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// /* -------------------- APP ROOT -------------------- */

// export default function App() {
//   const [onboarded, setOnboarded] = useState(false);
//   const [tab, setTab] = useState("feed");
//   const [myInterests, setMyInterests] = useState(["Cricket", "Gaming", "Movies"]);
//   // At the top of App.js component function alongside your other states:
//    const [showCompose, setShowCompose] = useState(false);
//   const [profilePic, setProfilePic] = useState(null);

//   // Fetch live profilePicture from DB whenever the user logs in (onboarded becomes true)
//   useEffect(() => {
//     if (!onboarded) return;
//     fetchMyProfile()
//       .then(res => {
//         const pic = res.data?.data?.profilePicture || null;
//         setProfilePic(pic);
//       })
//       .catch(() => {});
//   }, [onboarded]);

//   const [authStep, setAuthStep] = useState(0);
//   const [empId, setEmpId] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [selectedInterests, setSelectedInterests] = useState([]);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const [department, setDepartment] = useState("");
//   const [location,   setLocation]   = useState(""); 
//   const [building, setBuilding] = useState("");
//   const [floor, setFloor] = useState("");
//   const [error, setError] = useState("");
//   const [loginError, setLoginError] = useState("");

//   const handleIdentityNext = () => {
//     console.log("[DEBUG]", { empId, fullName, password, confirmPassword });
//     setError("");
//     if (!empId) { setError("ID_EMPTY"); return; }
//     if (!/^E\d{4}$/.test(empId)) { setError("ID_FORMAT_INVALID"); return; }
//     if (!fullName) { setError("NAME_EMPTY"); return; }
//     if (!password) { setError("PASSWORD_EMPTY"); return; }
//     if (password.length < 6) { setError("PASSWORD_TOO_SHORT"); return; }
//     if (!/^[A-Z]/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
//     if (!/\d/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
//     if (!/@/.test(password)) { setError("PASSWORD_FORMAT_INVALID"); return; }
//     if (password !== confirmPassword) { setError("PASSWORD_MISMATCH"); return; }
//     console.log("[DEBUG] All validations passed, setting authStep to 2");
//     setAuthStep(2);
//     console.log("[DEBUG] setAuthStep(2) called");
//   };

//   const handleWorkLocationNext = () => {
//     setError("");
//     if (!department) { setError("DEPT_EMPTY");     return; }
//     if (!location)   { setError("LOCATION_EMPTY"); return; }  // ADD THIS LINE
//     if (!building)   { setError("BUILDING_EMPTY"); return; }
//     if (!floor)      { setError("FLOOR_EMPTY");    return; }
//     setAuthStep(3);
// };

//   useEffect(() => {
//     const link = document.createElement("link");
//     link.rel = "preconnect";
//     link.href = "https://fonts.googleapis.com";
//     document.head.appendChild(link);

//     const link2 = document.createElement("link");
//     link2.rel = "stylesheet";
//     link2.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap";
//     document.head.appendChild(link2);
//   }, []);

//   const renderTab = () => {
//     switch (tab) {
//       case "feed": return <FeedScreen myInterests={myInterests} profilePic={profilePic} />;
//       case "discover": return <DiscoverScreen myInterests={myInterests} setMyInterests={setMyInterests} />;
//       case "events": return <EventsScreen />;
//       case "chat": return <ChatScreen profilePic={profilePic} />;
//       case "profile": return <ProfileScreen myInterests={myInterests} setMyInterests={setMyInterests} profilePic={profilePic} setProfilePic={setProfilePic} onLogout={() => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         setProfilePic(null);
//         setOnboarded(false);
//         setAuthStep(0);
//         setTab("feed");
//       }} />;
//       default: return null;
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         background: "#E8EAF6",
//         padding: "20px 0",
//       }}
//     >
//       {/* Phone shell */}
//       <div
//         style={{
//           width: 390,
//           height: 780,
//           borderRadius: 44,
//           backgroundImage: `url(${BackgroundImage})`,

//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//           boxShadow:
//             "0 30px 80px rgba(108,99,255,0.22), 0 10px 30px rgba(0,0,0,0.12)",
//           border: "8px solid #1A1A2E",
//           position: "relative",
//         }}
//       >
//         {/*top header
//        Notch */}
//         <div
//           style={{
//             height: 6,
//             backgroundImage: `url(${BackgroundImage})`,
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "flex-end",
//             paddingBottom: 6,
//             flexShrink: 0,
//           }}
//         >
//           <div
//             style={{
//               width: 110,
//               height: 20,
//               borderRadius: 12,
//               background: "#0D0D1A",
//             }}
//           />
//         </div>


//         {/* App bar */}

//         {onboarded && (
//           // <div style={{ background: "white", padding: "10px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1.5px solid ${COLORS.border}`, flexShrink: 0 }}>
//           // <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
//           <div
//             style={{
//               // background: "#0c0c0c",
//               backgroundImage: `url(${BackgroundImage})`,
//               padding: "10px 20px 8px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               // borderBottom: `1.5px solid ${COLORS.border}`,
//               flexShrink: 0,
//               display: "flex",
//             }}
//           >
//             <div
//               style={{
//                 backgroundImage: `url(${BackgroundImage})`,
//               }}>
//               <div
//                 style={{
//                   fontFamily: "sans-serif",
//                   fontWeight: 800,
//                   fontSize: 25,
//                   // background: `linear-gradient(135deg, #ed46c9, #35ffff) text`,
//                   background: "linear-gradient(135deg, #f99cf2, rgb(190 247 231)) text",
//                   letterSpacing: '0.6px',
//                   // WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: 'transparent',
//                 }}
//               >
//                 ConnectSphere
//               </div>
//               {/* Tagline */}
//   <div
//     style={{
//       fontFamily: "'DM Sans', sans-serif",
//       fontWeight: 600,
//       fontSize: 12,
//       // color: "rgba(233, 241, 241, 1)", // Semi-transparent white to match your cosmic theme
//       color: "rgba(245, 246, 246, 1)", 
//       letterSpacing: "1px",
//       marginTop: "2px", // Slight spacing below the title
//       textTransform: "uppercase", // Gives it a clean, modern look
//     }}
//   >
//     Connect. Share. Belong
//   </div>

  
//             </div>


            
//             <Avatar 
//              alt='VK'
//             // alt={currentUser?.avatar || '??'}
//             color={'#a7aebf'}
//              online 
//              backgroundColor='white'
//              image={profilePic || avatarDinosaur}
//             // image={currentUser?.profilePicture || null}
//               />
//           </div>
//         )}

        


//         {/* <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}> */}

//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//           }}
//         >
//           {!onboarded ? (
//             <>
//               {authStep === 0 && (
//                 <WelcomeAuthScreen
//                   error={loginError}
//                   onNext={() => setAuthStep(1)}
//                   onLogin={(data) => {
//                     if (data?.success) {
//                       localStorage.setItem("token", data.data.token);
//                       localStorage.setItem("user", JSON.stringify(data.data.user));
//                       if (data.data.user?.interests) {
//                         setMyInterests(data.data.user.interests);
//                       }
//                       setOnboarded(true);
//                     } else {
//                       setLoginError("INVALID_CREDENTIALS");
//                     }
//                   }}
//                 />
//               )}

//               {authStep === 1 && (
//                 <SignupIdentityScreen
//                   empId={empId} setEmpId={setEmpId}
//                   fullName={fullName} setFullName={setFullName}
//                   password={password} setPassword={setPassword}
//                   confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
//                   error={error}
//                   isAnonymous={isAnonymous} setIsAnonymous={setIsAnonymous}
//                   onNext={handleIdentityNext}
//                   onBack={() => setAuthStep(0)}
//                 />
//               )}

//               {authStep === 2 && (
                
//               <SignupWorkLocationScreen
//     department={department} setDepartment={setDepartment}
//     location={location}     setLocation={setLocation}       // ADD THIS LINE
//     building={building}     setBuilding={setBuilding}
//     floor={floor}           setFloor={setFloor}
//     error={error}
//     onNext={handleWorkLocationNext}
//     onBack={() => setAuthStep(1)}
// />)}

//               {authStep === 3 && (
//                 <SignupInterestsScreen
//                   interests={selectedInterests}
//                   setInterests={setSelectedInterests}
//                   identityData={{ empId, fullName, password, isAnonymous, department, location,building, floor }}
//                   onSubmit={(data) => {
//                     // After successful registration the backend now returns a token
//                     // (just like login does). Persist token + user so every
//                     // subsequent API call has auth, then jump into the app.
//                     if (data?.success) {
//                       localStorage.setItem("token", data.data.token);
//                       localStorage.setItem("user", JSON.stringify(data.data.user));
//                       if (data.data.user?.interests) {
//                         setMyInterests(data.data.user.interests);
//                       }
//                     } else {
//                       // Fallback to whatever the user just picked on the tile grid
//                       // — covers the (unlikely) case where the response shape is missing.
//                       setMyInterests(selectedInterests.length ? selectedInterests : myInterests);
//                     }
//                     setOnboarded(true);
//                   }}
//                   onBack={() => setAuthStep(2)}
//                 />
//               )}
//             </>
//           ) : (
//             <>
//               {/* <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}> */}
//               <div
//                 style={{
//                   flex: 1,
//                   overflowY: "auto",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 {renderTab()}
//               </div>
//               <BottomNav tab={tab} setTab={setTab} />
//             </>
//           )}
//         </div>
//       </div>
//     </div >
//     </LocalizationProvider>
//   );
// }




import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { COLORS } from "./constants";

import FeedScreen from "./screens/app/FeedScreen";
import DiscoverScreen from "./screens/app/DiscoverScreen";
import EventsScreen from "./screens/app/EventsScreen";
import ChatScreen from "./screens/app/chat/ChatScreen";
import ProfileScreen from "./screens/app/ProfileScreen";

import WelcomeAuthScreen from "./screens/auth/WelcomeAuthScreen 1";
import SignupIdentityScreen from "./screens/auth/SignupIdentityScreen 1";
import SignupWorkLocationScreen from "./screens/auth/SignupWorkLocationScreen";
import SignupInterestsScreen from "./screens/auth/SignupInterestsScreen";
import BackgroundImage from './images/background_img.png';
import Avatar from "../src/components/Avatar";
import avatarDinosaur from './images/avatarDinosaur.png';
import { fetchMyProfile } from "./services/profileService";
import { 
  fetchMyJoinedEvents, 
  acknowledgeEventUpdate, 
  acknowledgeEventCancellation, 
  acknowledgeAllEventNotices 
} from "./services/eventsService";

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
    <div
      style={{
        display: "flex",
        borderTop: `1.5px solid ${COLORS.border}`,
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
  const [showCompose, setShowCompose] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [chatTarget, setChatTarget] = useState(null); // added new.

  // ── Notification Center States ───────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Fetch notifications upon login / onboarding status
 const loadNotifications = async () => {
  try {
    const token = localStorage.getItem("token");

    // 1. Fetch Event Schedule Updates & Cancellations
    const eventsRes = await fetchMyJoinedEvents().catch(() => ({ data: [] }));
    const eventAlerts = (eventsRes?.data || []).filter(
      ev => ev.needsCancellationNotification || ev.needsNotification
    ).map(ev => ({
      id: ev.id,
      isEventNotif: true,
      isCanceled: ev.needsCancellationNotification,
      title: ev.title,
      date: ev.date,
      time: ev.time,
    }));

    // 2. Fetch Post Like Notifications from your backend Feed Controller
    const notifRes = await fetch("http://localhost:8082/api/feed/notifications", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).catch(() => ({ data: [] }));

    const postLikeAlerts = (notifRes?.data || []).map(n => ({
      id: n.id,
      isEventNotif: false, // 👈 Marks this item as a post-like notification!
      actorName: n.actorName,
      actorProfilePic: n.actorProfilePic,
      message: n.message,
      postImageThumbnail: n.postImageThumbnail,
    }));

    // Merge both into the single notifications array state
    setNotifications([...eventAlerts, ...postLikeAlerts]);
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
};

  // Fetch live profilePicture from DB whenever the user logs in
  useEffect(() => {
    if (!onboarded) return;
    fetchMyProfile()
      .then(res => {
        const pic = res.data?.data?.profilePicture || null;
        setProfilePic(pic);
      })
      .catch(() => {});

    loadNotifications();
  }, [onboarded]);

  // Handle single notification dismissal
  // const handleDismissSingle = async (ev) => {
  //   try {
  //     if (ev.needsCancellationNotification) {
  //       await acknowledgeEventCancellation(ev.id);
  //     } else {
  //       await acknowledgeEventUpdate(ev.id);
  //     }
  //     setNotifications(prev => prev.filter(item => item.id !== ev.id));
  //   } catch (err) {
  //     console.error("Failed to dismiss notification:", err);
  //   }
  // };

  // Handle clear all notifications
  // const handleClearAllNotifs = async () => {
  //   try {
  //     await acknowledgeAllEventNotices(notifications);
  //     setNotifications([]);
  //     setShowNotifDrawer(false);
  //   } catch (err) {
  //     console.error("Failed to clear all notifications:", err);
  //   }
  // };


  // Dismiss a single notification item
const handleDismissSingle = async (item) => {
    try {
        const token = localStorage.getItem("token");

        if (item.isEventNotif) {
            // Event Service (8083)
            if (item.isCanceled) {
                await acknowledgeEventCancellation(item.id);
            } else {
                await acknowledgeEventUpdate(item.id);
            }
        } else {
            // Feed Service (8082)
            await fetch(`http://localhost:8082/api/feed/notifications/${item.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        // Remove from local screen state
        setNotifications(prev => prev.filter(notif => notif.id !== item.id));
    } catch (err) {
        console.error("Failed to dismiss notification:", err);
    }
};

// Clear all notifications
const handleClearAllNotifs = async () => {
    try {
        const token = localStorage.getItem("token");

        // 1. Clear Event notifications if any exist
        const eventNotifs = notifications.filter(n => n.isEventNotif);
        if (eventNotifs.length > 0) {
            await acknowledgeAllEventNotices(eventNotifs);
        }

        // 2. Clear Post notifications in FeedService (8082)
        const postNotifs = notifications.filter(n => !n.isEventNotif);
        if (postNotifs.length > 0) {
            await fetch("http://localhost:8082/api/feed/notifications/clear-all", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        setNotifications([]);
        setShowNotifDrawer(false);
    } catch (err) {
        console.error("Failed to clear all notifications:", err);
    }
};
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
    if (!location)   { setError("LOCATION_EMPTY"); return; }
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
    // case "discover": return <DiscoverScreen myInterests={myInterests} setMyInterests={setMyInterests} />;
    case "discover": return <DiscoverScreen myInterests={myInterests} setMyInterests={setMyInterests} setTab={setTab} setChatTarget={setChatTarget} />;
    case "events": return <EventsScreen myInterests={myInterests} />;
    // case "chat": return <ChatScreen profilePic={profilePic} />;
    case "chat": return <ChatScreen profilePic={profilePic} chatTarget={chatTarget} onChatTargetHandled={() => setChatTarget(null)} />;
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
          {/* Top Notch */}
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

          {/* App Header Bar */}
          {onboarded && (
            <div
              style={{
                backgroundImage: `url(${BackgroundImage})`,
                padding: "10px 18px 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "sans-serif",
                    fontWeight: 800,
                    fontSize: 25,
                    background: "linear-gradient(135deg, #f99cf2, rgb(190 247 231)) text",
                    letterSpacing: '0.6px',
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
                    color: "rgba(245, 246, 246, 1)", 
                    letterSpacing: "1px",
                    marginTop: "2px",
                    textTransform: "uppercase",
                  }}
                >
                  Connect. Share. Belong
                </div>
              </div>

              {/* Header Right Controls: Bell + Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* 🔔 Notification Bell Button */}
                {/* {tab==="feed" &&(
                <div style={{ position: "relative" }}>
                  <button 
                    onClick={() => setShowNotifDrawer(prev => !prev)}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>🔔</span> */}

                    {/* Unread Red Badge Count */}
                    {/* {notifications.length > 0 && (
                      <span style={{
                        position: "absolute",
                        top: -2,
                        right: -2,
                        background: "#EF4444",
                        color: "white",
                        borderRadius: "10px",
                        padding: "1px 5px",
                        fontSize: "9px",
                        fontWeight: 800,
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                        border: "1.5px solid white"
                      }}>
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div> */}
                {/* )} */}
                {/* 🔔 Glassmorphism Notification Bell Button */}
{tab === "feed" && (
  <div style={{ position: "relative" }}>
    <button 
      onClick={() => setShowNotifDrawer(prev => !prev)}
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        borderRadius: "50%",
        width: 38,
        height: 38,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
    >
      {/* Clean White Vector Bell Icon */}
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="white" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Modern Red Badge Counter */}
      {notifications.length > 0 && (
        <span style={{
          position: "absolute",
          top: -2,
          right: -2,
          background: "linear-gradient(135deg, #FF4B4B, #FF6584)",
          color: "white",
          borderRadius: "10px",
          padding: "1px 5px",
          fontSize: "9px",
          fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 8px rgba(255, 75, 75, 0.6)",
          border: "1.5px solid #1A1A2E", // Matches phone inner frame color
        }}>
          {notifications.length}
        </span>
      )}
    </button>
  </div>
)}

                {/* Profile Picture Avatar */}
                <Avatar 
                  alt='VK'
                  color={'#a7aebf'}
                  online 
                  backgroundColor='white'
                  image={profilePic || avatarDinosaur}
                />
              </div>
            </div>
          )}

          {/* Main App Screen Body */}
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
                    location={location}     setLocation={setLocation}
                    building={building}     setBuilding={setBuilding}
                    floor={floor}           setFloor={setFloor}
                    error={error}
                    onNext={handleWorkLocationNext}
                    onBack={() => setAuthStep(1)}
                  />
                )}

                {authStep === 3 && (
                  <SignupInterestsScreen
                    interests={selectedInterests}
                    setInterests={setSelectedInterests}
                    identityData={{ empId, fullName, password, isAnonymous, department, location, building, floor }}
                    onSubmit={(data) => {
                      if (data?.success) {
                        localStorage.setItem("token", data.data.token);
                        localStorage.setItem("user", JSON.stringify(data.data.user));
                        if (data.data.user?.interests) {
                          setMyInterests(data.data.user.interests);
                        }
                      } else {
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

         {/* ── Notification Center Drawer / Modal ─────────────────────────────── */}
{showNotifDrawer && tab === "feed" && (
  <>
    {/* Backdrop Overlay */}
    <div 
      onClick={() => setShowNotifDrawer(false)} 
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9998 }} 
    />

    {/* Floating Drawer Sheet */}
    <div style={{
      position: "absolute",
      top: 65,
      right: 12,
      left: 12,
      maxHeight: "65vh",
      background: "#FFFFFF",
      borderRadius: 20,
      zIndex: 9999,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      border: `1.5px solid ${COLORS.border || '#e0e0e0'}`,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: `1px solid ${COLORS.border || '#e0e0e0'}`,
        background: "#F8F7FF"
      }}>
        <div style={{ fontWeight: 800, fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: COLORS.text || '#333' }}>
          🔔 Notifications ({notifications.length})
        </div>
        
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAllNotifs}
            style={{
              background: "none", border: "none", color: "#6C63FF",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Body Item List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", scrollbarWidth: "none" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 10px", color: COLORS.muted || '#888', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            🎉 All caught up! No new notifications.
          </div>
        ) : (
          notifications.map(item => {
            // ── CASE 1: Post Like Notification ──
            if (!item.isEventNotif) {
              return (
                <div key={item.id} style={{
                  background: "#F8F7FF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 14,
                  padding: "10px 12px",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <Avatar 
                      image={item.actorProfilePic || avatarDinosaur} 
                      size={32} 
                      backgroundColor="#E2E8F0"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text || '#1b1d23', fontFamily: "'DM Sans', sans-serif" }}>
                        <strong>{item.actorName}</strong> liked your post.
                      </div>
                    </div>
                  </div>

                  {/* Condensed Post Image Thumbnail */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {item.postImageThumbnail && (
                      <img 
                        src={item.postImageThumbnail} 
                        alt="Post Thumbnail" 
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: "1px solid #CBD5E1"
                        }}
                      />
                    )}
                    <button 
                      onClick={() => handleDismissSingle(item)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94A3B8", fontWeight: "bold" }}
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            }

            // ── CASE 2: Event Update / Cancellation Notification ──
            const isCanceled = item.needsCancellationNotification || item.isCanceled;
            return (
              <div 
                key={item.id}
                style={{
                  background: isCanceled ? "#FEF2F2" : "#F8F7FF",
                  border: isCanceled ? "1.5px solid #FCA5A5" : "1.5px solid #C7D2FE",
                  borderRadius: 14,
                  padding: "10px 12px",
                  marginBottom: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: isCanceled ? "#EF4444" : "#4F46E5",
                    fontFamily: "'DM Sans', sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    {isCanceled ? "🚨 Event Canceled" : "📅 Schedule Changed"}
                  </span>
                  <button 
                    onClick={() => handleDismissSingle(item)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, color: COLORS.muted || '#888', fontWeight: "bold"
                    }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.text || '#333', fontFamily: "'DM Sans', sans-serif" }}>
                  {item.title}
                </div>

                <div style={{ fontSize: 11, color: "#4A5568", fontFamily: "'DM Sans', sans-serif" }}>
                  {isCanceled ? (
                    "The host has canceled this event. It has been removed from your schedule."
                  ) : (
                    <>
                      New timing: <strong>{item.date}</strong> at <strong>{item.time ? dayjs(`2026-01-01T${item.time}`).format('hh:mm A') : ''}</strong>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </>
)}
        </div>
      </div>
    </LocalizationProvider>
  );
}