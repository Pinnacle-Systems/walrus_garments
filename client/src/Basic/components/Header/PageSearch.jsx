import React, { useEffect, useState } from 'react'
import useOutsideClick from '../../../CustomHooks/handleOutsideClick';
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
import { Search } from 'lucide-react';


const PageSearch = ({ pageList }) => {
    const [isListShow, setIsListShow] = useState(false)
    const inputRef = useOutsideClick(() => { setIsListShow(false) })
    const [filteredPages, setFilteredPages] = useState(pageList)
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();



    useEffect(() => {
        let pageSearchComponent = document.getElementById("pageSearch");
        pageSearchComponent.addEventListener('keydown', function (ev) {
            var focusableElementsString = '[tabindex="0"]';
            let ol = document.querySelectorAll(focusableElementsString);
            if (ev.key === "ArrowDown") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            } else if (ev.key === "ArrowUp") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = ol[i - 1];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            }
        });
        return () => {
            pageSearchComponent.removeEventListener('keydown', () => { });
        };
    }, []);


    console.log(filteredPages, "filteredPages")
    useEffect(() => {
        setFilteredPages(pageList)
    }, [pageList])
    useEffect(() => {
        // if (!search) { setFilteredPages(pageList) }
        setFilteredPages(pageList.filter(page => page.name.toLowerCase().includes(search.toLowerCase())))
    }, [search])
    return (
        <div id='pageSearch' className='relative flex flex-col text-black z-10' ref={inputRef}>

            <div className='flex items-center text-[12px] border rounded-full relative mr-3'
            >
                <input className=' px-2 py-1 w-60 text-[12px] rounded-full'
                    placeholder='Global Search...' type='text' name='password' id='password'
                    onChange={(e) => { setSearch(e.target.value); }}
                    onClick={() => { setIsListShow(true) }}
                    value={search}
                    onFocus={() => { setIsListShow(true) }} />
                <div className='absolute right-2  text-neutral-500'>
                    <Search size={15} />
                </div>
            </div>
            {isListShow &&
                <ul className='absolute max-h-[300px] overflow-auto bg-white top-7  text-[15px] w-[250px] border border-gray-300 rounded-lg
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-150 shadow-sm'>{console.log(isListShow, "isListShow")}

                    {filteredPages?.map((page) => <li className='cursor-pointer'
                        key={page.id}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                dispatch(push(page));
                                setSearch("");
                                setIsListShow((false));
                            }
                        }}

                        onClick={() => { dispatch(push(page)); setSearch(""); setIsListShow((false)); }} >
                        <pre
                            className='text-[12px] text-neutral-800'
                        > {page.name} </pre></li>)}
                </ul>
            }
        </div>
    )
}

export default PageSearch
