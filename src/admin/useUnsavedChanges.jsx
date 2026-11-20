import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

const UnsavedContext = createContext({
  setDirty() {},
  confirmLeave: () => true,
});

export function UnsavedChangesProvider({ children }) {
  const dirty = useRef(false);
  const setDirty = useCallback((value) => {
    dirty.current = value;
  }, []);
  const confirmLeave = useCallback(
    () =>
      !dirty.current ||
      window.confirm("Ke ndryshime të paruajtura. Të dalësh pa i ruajtur?"),
    [],
  );
  useEffect(() => {
    const warn = (event) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  return (
    <UnsavedContext.Provider value={{ setDirty, confirmLeave }}>
      {children}
    </UnsavedContext.Provider>
  );
}

export const useUnsavedChanges = () => useContext(UnsavedContext);

export function useDirtyForm(value) {
  const { setDirty, confirmLeave } = useUnsavedChanges();
  const serialized = JSON.stringify(value);
  const initial = useRef(serialized);
  useEffect(() => {
    setDirty(serialized !== initial.current);
  }, [serialized, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);
  const markSaved = () => {
    initial.current = serialized;
    setDirty(false);
  };
  return { markSaved, confirmLeave };
}
