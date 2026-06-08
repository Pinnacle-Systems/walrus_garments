import React, { useState, useMemo, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { ExpandLess, ExpandMore, Pages } from "@mui/icons-material";
import Collapse from "@mui/material/Collapse";
import { FaDatabase, FaMoneyBill } from "react-icons/fa";
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import OpacityIcon from "@mui/icons-material/Opacity";
import { useDispatch, useSelector } from "react-redux";
import { push } from "../../redux/features/opentabs";
import { useGetUsersQuery } from "../../redux/service/user";
import { ColorContext } from "./context/ColorContext";
import { useContext } from "react";
import ActiveTabList from "../ActiveTab";
import secureLocalStorage from "react-secure-storage";
import axios, { all } from "axios";
import { Item } from "devextreme-react/cjs/funnel";
import { PermissionContext } from "./context/PermissionContext";
import { getCommonParams } from "../../utils/hleper";
import {
  useGetRoleQuery,
  useGetuserpagesQuery,
} from "../../redux/service/Rolemaster";
const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#E5E7EB", // <-- updated color here
  borderRadius: "50%",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.5, 1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// const SidebarContainer = styled(Box)(({ theme, isCollapsed }) => ({
//   width: isCollapsed ? '50px' : '180px',
//   overflow: 'hidden',
//   backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#F9FAFB',
//   transition: 'width 0.3s ease, background-color 0.3s ease',
//   height: '100vh',
//   boxShadow: isCollapsed ? 'none' : '2px 0 4px rgba(0, 0, 0, 0.1)',
//   paddingTop: theme.spacing(1),
//   paddingLeft: "5px"
// }));
const SidebarContainer = styled(Box)(({ isCollapsed }) => ({
  width: isCollapsed ? "10px" : "180px",
  background: "#F9FAFB",
  height: "100vh",
  position: "sticky",
  left: 0,
  top: 0,
  zIndex: 1000,
  overflow: "hidden",
  transition: "width 0.3s ease",
}));

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openERP, setOpenERP] = useState(false);
  const dispatch = useDispatch();
  const { color } = useContext(ColorContext);
  const { setPermissions } = useContext(PermissionContext);

  const params = getCommonParams();
  const { userId, isSuperAdmin, roleId } = params;

  const skip = isSuperAdmin === true || !userId;

  const { data: allData, refetch: Getrefetch } = useGetRoleQuery();

  const Rolename = allData?.find((item) => item?.id === roleId)?.rolename;


  const { data: allPages, refetch: pagerefetch } = useGetuserpagesQuery(
    { params: { userId } },
    { skip }
  );




  const permissionMap = {};
  allPages?.forEach((p) => {
    permissionMap[p.link] = {
      read: p.read,
      create: p.create,
      edit: p.edit,
      delete: p.delete,
    };

  });
  setPermissions(permissionMap);
  // console.log(isSuperAdmin);

  return (
    <SidebarContainer>
      <List className="">
        {isSuperAdmin === true && (
          <>
            <Tooltip
              title="PayRoll"
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <StyledListItemButton
                onClick={() => dispatch(push({ id: 1, name: "Dashboard" }))}
              >
                <StyledListItemIcon>
                  <DashboardIcon
                    sx={{
                      color: color ? `${color}` : "#CA8A04",
                      fontSize: "28px",
                      background: "white",
                    }}
                  />
                </StyledListItemIcon>
                {/* {!isCollapsed && ( */}
                <ListItemText
                  primary="Dashboard"
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                  sx={{ ml: 1 }}
                />
                {/* )} */}
              </StyledListItemButton>
            </Tooltip>
            <Tooltip
              title="ERP"
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <StyledListItemButton
                onClick={() => dispatch(push({ id: 2, name: "ERP" }))}
              >
                <StyledListItemIcon>
                  <FaDatabase
                    style={{
                      color: color || "#CA8A04",
                      fontSize: "20px",
                      background: "white",
                    }}
                  />
                </StyledListItemIcon>
                {/* {!isCollapsed && ( */}
                <ListItemText
                  primary="ERP"
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                  }}
                  sx={{ ml: 1 }}
                />
                {/* )} */}
              </StyledListItemButton>
            </Tooltip>
            {/*   already uncomment
        <Tooltip title="User" placement="right" disableHoverListener={!isCollapsed}>
        <StyledListItemButton onClick={() => dispatch(push({ id: 4, name: 'User' }))}>
          <StyledListItemIcon>
            <PersonIcon sx={{ color: color ? `${color}` : '#CA8A04', fontSize: '28px', background: "white" }} />
          </StyledListItemIcon>
          {!isCollapsed && (
          <ListItemText
            primary="User"
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
            sx={{ ml: 1 }}
          />
           )} 
        </StyledListItemButton>
        </Tooltip> */}
            <Tooltip
              title="User"
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <>
                <StyledListItemButton onClick={() => setOpenERP(!openERP)}>
                  <StyledListItemIcon>
                    <FaDatabase
                      style={{
                        color: color || "#CA8A04",
                        fontSize: "20px",
                        background: "white",
                      }}
                    />
                  </StyledListItemIcon>
                  <ListItemText
                    primary="User Management"
                    primaryTypographyProps={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                    sx={{ ml: 1 }}
                  />
                  {openERP ? <ExpandLess /> : <ExpandMore />}
                </StyledListItemButton>

                {/* Dropdown (collapsible) items */}
                <Collapse in={openERP} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <StyledListItemButton
                      sx={{ pl: 6 }}
                      onClick={() => dispatch(push({ id: 4, name: "User" }))}
                    >
                      <ListItemText
                        primary="User"
                        primaryTypographyProps={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      />
                    </StyledListItemButton>

                    <StyledListItemButton
                      sx={{ pl: 6 }}
                      onClick={() => dispatch(push({ id: 5, name: "Roles" }))}
                    >
                      <ListItemText
                        primary="Roles"
                        primaryTypographyProps={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      />
                    </StyledListItemButton>
                    {/* <StyledListItemButton
                  sx={{ pl: 6 }}
                  onClick={() => dispatch(push({ id: 6, name: 'UserCompany' }))}
                >
                  <ListItemText primary="Company Allocation"
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }} />
                </StyledListItemButton> */}

                    {/* <StyledListItemButton
          sx={{ pl: 6 }}
          onClick={() => dispatch(push({ id: 23, name: 'ERP Settings' }))}
        >
          <ListItemText primary="ERP Settings" />
        </StyledListItemButton> */}
                  </List>
                </Collapse>
              </>
            </Tooltip>

            <Tooltip
              title="MIS Dashborad"
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <StyledListItemButton
                onClick={() => dispatch(push({ id: 7, name: "MISDashboard" }))}
              >
                <StyledListItemIcon>
                  <PersonIcon
                    sx={{
                      color: color ? `${color}` : "#CA8A04",
                      fontSize: "28px",
                      background: "white",
                    }}
                  />
                </StyledListItemIcon>
                {/* {!isCollapsed && ( */}
                <ListItemText
                  primary="MIS Dashboard"
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                  sx={{ ml: 1 }}
                />
                {/* )} */}
              </StyledListItemButton>
            </Tooltip>
            <Tooltip
              title="HR Dashborad"
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <StyledListItemButton
                onClick={() => dispatch(push({ id: 8, name: "HRDashBoard" }))}
              >
                <StyledListItemIcon>
                  <PersonIcon
                    sx={{
                      color: color ? `${color}` : "#CA8A04",
                      fontSize: "28px",
                      background: "white",
                    }}
                  />
                </StyledListItemIcon>
                {/* {!isCollapsed && ( */}
                <ListItemText
                  primary="HR Dashboard"
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}
                  sx={{ ml: 1 }}
                />
                {/* )} */}
              </StyledListItemButton>
            </Tooltip>
          </>
        )}


        {Rolename === "Admin" && (
          <Tooltip
            title="User"
            placement="right"
            disableHoverListener={!isCollapsed}
          >
            <>
              <StyledListItemButton onClick={() => setOpenERP(!openERP)}>
                <StyledListItemIcon>
                  <FaDatabase
                    style={{
                      color: color || "#CA8A04",
                      fontSize: "20px",
                      background: "white",
                    }}
                  />
                </StyledListItemIcon>
                <ListItemText
                  primary="User Management"
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                  sx={{ ml: 1 }}
                />
                {openERP ? <ExpandLess /> : <ExpandMore />}
              </StyledListItemButton>

              {/* Sub-menu items */}
              <Collapse in={openERP} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <StyledListItemButton
                    sx={{ pl: 6 }}
                    onClick={() => dispatch(push({ id: 4, name: "User" }))}
                  >
                    <ListItemText
                      primary="User"
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                  </StyledListItemButton>

                  <StyledListItemButton
                    sx={{ pl: 6 }}
                    onClick={() => dispatch(push({ id: 5, name: "Roles" }))}
                  >
                    <ListItemText
                      primary="Roles & Allocation"
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                  </StyledListItemButton>
                </List>
              </Collapse>
            </>
          </Tooltip>
        )}

        {allPages?.map((page) => (
          <Tooltip
            key={page.id}
            title={page.link}
            placement="right"
            disableHoverListener={!isCollapsed}
          >
            <StyledListItemButton
              onClick={() => dispatch(push({ id: page.id, name: page.link }))}
            >
              <StyledListItemIcon>
                {page.link === "Dashboard" && <DashboardIcon sx={{ color }} />}
                {page.link === "ERP" && <FaDatabase style={{ color }} />}
                {page.link === "User" && <PersonIcon sx={{ color }} />}
                {page.link === "MISDashboard" && <PersonIcon sx={{ color }} />}
                {page.link === "HRDashboard" && <PersonIcon sx={{ color }} />}
                {page.link === "Dyeing Dashboard" && <OpacityIcon sx={{ color }} />}
                {page.link === "Garments Dashboard" && <DashboardIcon sx={{ color }} />}
              </StyledListItemIcon>

              <ListItemText
                primary={page.link}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
                sx={{ ml: 1 }}
              />
            </StyledListItemButton>
          </Tooltip>
        ))}
      </List>
    </SidebarContainer>

    // <SidebarContainer >
    //   <List className="mt-3">
    //     <Tooltip title="PayRoll" placement="right" disableHoverListener={!isCollapsed}>
    //       <StyledListItemButton onClick={() => dispatch(push({ id: 1, name: 'Dashboard' }))}>
    //         <StyledListItemIcon>
    //           <DashboardIcon sx={{ color: color ? `${color}` : '#CA8A04', fontSize: '28px', background: "white" }} />
    //         </StyledListItemIcon>
    //         {/* {!isCollapsed && ( */}
    //         <ListItemText
    //           primary="Dashboard"
    //           primaryTypographyProps={{
    //             fontSize: '0.875rem',
    //             fontWeight: '500',
    //           }}
    //           sx={{ ml: 1 }}
    //         />
    //         {/* )} */}
    //       </StyledListItemButton>
    //     </Tooltip>
    //     <Tooltip title="ERP" placement="right" disableHoverListener={!isCollapsed}>
    //       <StyledListItemButton onClick={() => dispatch(push({ id: 2, name: 'ERP' }))}>
    //         <StyledListItemIcon>
    //           <FaDatabase
    //             style={{
    //               color: color || '#CA8A04',
    //               fontSize: '20px',
    //               background: 'white',
    //             }}
    //           />
    //         </StyledListItemIcon>
    //         {/* {!isCollapsed && ( */}
    //         <ListItemText
    //           primary="ERP"
    //           primaryTypographyProps={{
    //             fontSize: '0.875rem',
    //             fontWeight: 500,
    //           }}
    //           sx={{ ml: 1 }}
    //         />
    //         {/* )} */}
    //       </StyledListItemButton>
    //     </Tooltip>
    //         {/*   already uncomment
    //     <Tooltip title="User" placement="right" disableHoverListener={!isCollapsed}>
    //     <StyledListItemButton onClick={() => dispatch(push({ id: 4, name: 'User' }))}>
    //       <StyledListItemIcon>
    //         <PersonIcon sx={{ color: color ? `${color}` : '#CA8A04', fontSize: '28px', background: "white" }} />
    //       </StyledListItemIcon>
    //       {!isCollapsed && (
    //       <ListItemText
    //         primary="User"
    //         primaryTypographyProps={{
    //           fontSize: '0.875rem',
    //           fontWeight: '500',
    //         }}
    //         sx={{ ml: 1 }}
    //       />
    //        )}
    //     </StyledListItemButton>
    //     </Tooltip> */}
    //     <Tooltip title="User" placement="right" disableHoverListener={!isCollapsed}>
    //       <>
    //         <StyledListItemButton onClick={() => setOpenERP(!openERP)}>
    //           <StyledListItemIcon>
    //             <FaDatabase
    //               style={{
    //                 color: color || '#CA8A04',
    //                 fontSize: '20px',
    //                 background: 'white',
    //               }}
    //             />
    //           </StyledListItemIcon>
    //           <ListItemText
    //             primary="User Management"
    //             primaryTypographyProps={{
    //               fontSize: '0.875rem',
    //               fontWeight: 500,
    //             }}
    //             sx={{ ml: 1 }}
    //           />
    //           {openERP ? <ExpandLess /> : <ExpandMore />}
    //         </StyledListItemButton>

    //         {/* Dropdown (collapsible) items */}
    //         <Collapse in={openERP} timeout="auto" unmountOnExit>
    //           <List component="div" disablePadding>
    //             <StyledListItemButton
    //               sx={{ pl: 6 }}
    //               onClick={() => dispatch(push({ id: 4, name: 'User' }))}
    //             >
    //               <ListItemText primary="User"
    //                 primaryTypographyProps={{
    //                   fontSize: '0.875rem',
    //                   fontWeight: 500,
    //                 }}
    //               />
    //             </StyledListItemButton>

    //             <StyledListItemButton
    //               sx={{ pl: 6 }}
    //               onClick={() => dispatch(push({ id: 5, name: 'Roles' }))}
    //             >
    //               <ListItemText primary="Roles & Allocation"
    //                 primaryTypographyProps={{
    //                   fontSize: '0.875rem',
    //                   fontWeight: 500,
    //                 }} />
    //             </StyledListItemButton>

    //             {/* <StyledListItemButton
    //       sx={{ pl: 6 }}
    //       onClick={() => dispatch(push({ id: 23, name: 'ERP Settings' }))}
    //     >
    //       <ListItemText primary="ERP Settings" />
    //     </StyledListItemButton> */}
    //           </List>
    //         </Collapse>
    //       </>
    //     </Tooltip>

    //     <Tooltip title="Main Dashborad" placement="right" disableHoverListener={!isCollapsed}>
    //       <StyledListItemButton onClick={() => dispatch(push({ id: 6, name: 'Main' }))}>
    //         <StyledListItemIcon>
    //           <PersonIcon sx={{ color: color ? `${color}` : '#CA8A04', fontSize: '28px', background: "white" }} />
    //         </StyledListItemIcon>
    //         {/* {!isCollapsed && ( */}
    //         <ListItemText
    //           primary="Main Dashboard"
    //           primaryTypographyProps={{
    //             fontSize: '0.875rem',
    //             fontWeight: '500',
    //           }}
    //           sx={{ ml: 1 }}
    //         />
    //         {/* )} */}
    //       </StyledListItemButton>
    //     </Tooltip>
    //   </List>
    // </SidebarContainer>
  );
};

export default Sidebar;
