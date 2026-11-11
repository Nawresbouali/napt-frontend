import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Bienvenue from './pages/Bienvenue'
import Connexion from './pages/Connexion'
import InvitePage from './pages/InvitePage'
import Layout from './components/Layout'
import TableauDeBord from './pages/TableauDeBord'
import Scans from './pages/Scans'
import RechercheCVE from './pages/RechercheCVE'
import AnalyseIA from './pages/AnalyseIA'
import Rapports from './pages/Rapports'
import Audit from './pages/Audit'
import ScanReseau from './pages/ScanReseau'
import Utilisateurs from './pages/Utilisateurs'
import LiveScan from './pages/LiveScan'
import Profil from './pages/Profil'
import Chatbot from './pages/Chatbot'

const Protege = ({ children }) => {
  const t = localStorage.getItem('napt_token')
  return t ? children : <Navigate to="/connexion" />
}

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('napt_user') || '{}')
  if (!localStorage.getItem('napt_token')) return <Navigate to="/connexion" />
  if (user.role !== 'admin') return <Navigate to="/tableau-de-bord" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Bienvenue />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route element={<Protege><Layout /></Protege>}>
        <Route path="tableau-de-bord" element={<TableauDeBord />} />
        <Route path="scans"           element={<Scans />} />
        <Route path="recherche-cve"   element={<RechercheCVE />} />
        <Route path="analyse-ia"      element={<AnalyseIA />} />
        <Route path="rapports"        element={<Rapports />} />
        <Route path="scan-reseau"     element={<ScanReseau />} />
        <Route path="chatbot"         element={<Chatbot />} />
        <Route path="profil"          element={<Profil />} />
        <Route path="audit"           element={<AdminRoute><Audit /></AdminRoute>} />
        <Route path="utilisateurs"    element={<AdminRoute><Utilisateurs /></AdminRoute>} />
        <Route path="scans/:scanId/live" element={<LiveScan />} />
      </Route>
    </Routes>
  )
}
