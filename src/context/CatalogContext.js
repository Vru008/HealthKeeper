import { createContext, useContext, useState, useEffect } from "react";

// The full hospital/doctor catalog is served as a static file from public/ and
// fetched once at startup, so it stays out of the JS bundle but still works
// without the Express backend (any static host serves it).
const CatalogContext = createContext({
  doctors: [],
  hospitals: [],
  loading: true,
});

export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider = ({ children }) => {
  const [state, setState] = useState({
    doctors: [],
    hospitals: [],
    loading: true,
  });

  useEffect(() => {
    fetch("/catalog.json")
      .then((r) => r.json())
      .then((c) =>
        setState({
          doctors: c.doctors || [],
          hospitals: c.hospitals || [],
          loading: false,
        })
      )
      .catch(() => setState({ doctors: [], hospitals: [], loading: false }));
  }, []);

  return (
    <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
  );
};
