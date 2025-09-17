import React from 'react'
import {Routes, Route, Link} from "react-router-dom"
import Home from './pages/Home'
export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
      </Routes>
    </div>
  )
}
