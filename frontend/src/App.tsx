import React, { useState } from "react";
import "./App.css";
import ServiceInjector from "api/service.injector";
import { Country } from "api/contries-service";

function App() {
  const countriesService = ServiceInjector.countriesService;
  const [countries, setContries] = useState<Country[]>([]);
  countriesService.getCountriesList().then((data: Country[]) => {
    console.log(data);

    setContries(data);
  });
  return <div className="App">{JSON.stringify(countries)}</div>;
}

export default App;
