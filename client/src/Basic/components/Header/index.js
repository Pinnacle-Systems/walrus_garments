
import "./Header.css"
import dp from "../../../assets/default-dp.png"
import { Bell, Search } from "lucide-react"
import { useState } from "react";
import Profile from "./Profile";
import logo from "../../../assets/pinnacle2.jpeg"
// import { useState } from "react"

const Header = ({ profile, setProfile }) => {


    return (
        <div className='py-1  w-full flex justify-between items-center bg-white shadow-sm fixed z-50'>
            <div className="w-32 ms-3">
                <img className="rounded-lg"
                    src={logo}
                    alt="" />
            </div>
            <div className="mr-9 flex items-center  justify-content-between">
                <div className='flex items-center text-[12px] border rounded-full relative mr-3'>
                    <input className=' px-2 py-1 w-60 text-[12px] rounded-full' placeholder='search' type='text' name='password' id='password' />
                    <div className='absolute right-2  text-neutral-500'>
                        <Search size={15} />
                    </div>
                </div>
                <div className="mr-3 bg-beige p-2 rounded-full ">
                    <Bell size={17} />
                </div>
                <div className="relative">
                    <img className="rounded-full cursor-pointer" onClick={() => setProfile(!profile)} width={'25px'}
                        src={dp}
                        alt="image" />

                    {/* profile details */}
                    {profile && <Profile
                        dp={dp}
                        setProfile={setProfile} />}

                </div>
            </div>

        </div>
    )
}

export default Header
