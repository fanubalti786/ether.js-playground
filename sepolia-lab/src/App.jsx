import React from 'react'
import {Routes, Route, Link} from "react-router-dom"
import Home from './pages/Home'
import Dapp from './pages/Dapp'
export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/dapp' element={<Dapp/>}></Route>
      </Routes>
    </div>
  )
}
