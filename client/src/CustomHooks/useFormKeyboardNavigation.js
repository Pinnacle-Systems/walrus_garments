import { useRef, useCallback } from 'react';

export const useFormKeyboardNavigation = () => {
  const firstInputRef = useRef(null);
  const secondInputRef = useRef(null);
  const thirdInputRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const movedToNextSaveNewRef = useRef(null);
  const saveCloseButtonRef = useRef(null);
  const saveNewButtonRef = useRef(null);

  const handleLastInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      toggleButtonRef.current?.focus();
    }
  }, []);

  const handleToggleKeyDown = useCallback((e) => {

    if (e.key === 'Enter' && !e.shiftKey) {
      console.log("reciev the forem evenet ,", e.key, !e.shiftKey)
      e.preventDefault();
      saveCloseButtonRef.current?.focus();
    }
  }, []);

  const handleSaveCloseKeyDown = useCallback((saveDataFn) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveDataFn("close");
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      saveNewButtonRef.current?.focus(); // ✅ explicit tab to Save & New
    }
  }, []);

  const handleSaveNewKeyDown = useCallback((saveDataFn) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveNewButtonRef.current?.blur(); // ✅ blur before save
      saveDataFn("new");
    }
  }, []);

  const focusFirstInput = useCallback(() => {
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, []);


  const handleTabKeyDown = useCallback((e) => {

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      saveCloseButtonRef.current?.focus();
    }
  }, []);

  return {
    refs: {
      firstInputRef,
      secondInputRef,
      thirdInputRef,
      toggleButtonRef,
      movedToNextSaveNewRef,
      saveCloseButtonRef,
      saveNewButtonRef,
    },
    handlers: {
      handleLastInputKeyDown,
      handleToggleKeyDown,
      handleSaveCloseKeyDown,
      handleSaveNewKeyDown,
      handleTabKeyDown
    },
    focusFirstInput,
  };
};