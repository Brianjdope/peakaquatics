import React, { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Constants from 'expo-constants'

const API_BASE = Constants?.expoConfig?.extra?.apiBaseUrl || 'https://your-vercel-domain.vercel.app/api'
const SESSION_TYPES = ['Intro Call', 'Video Review', 'Private Session', 'Semi-Group', 'Group Session', 'Dryland']

export default function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [session, setSession] = useState('Private Session')
  const [createdBookingId, setCreatedBookingId] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [bookings, setBookings] = useState([])
  const [message, setMessage] = useState('')
  const canCreate = useMemo(() => name.length > 1 && email.length > 4 && date.length > 5 && time.length > 2, [name, email, date, time])
  const canCancel = useMemo(() => email.length > 4 && bookingId.length > 3, [email, bookingId])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050505', padding: 20 }}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '700', marginBottom: 8 }}>Peak Aquatic</Text>
        <Text style={{ color: '#b4b4b4', marginBottom: 16 }}>Book, lookup, and cancel sessions in one place.</Text>

        <Text style={{ color: '#fff', marginBottom: 6 }}>Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 10 }} />

        <Text style={{ color: '#fff', marginBottom: 6 }}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 10 }} />

        <Text style={{ color: '#fff', marginBottom: 6 }}>Phone (optional)</Text>
        <TextInput value={phone} onChangeText={setPhone} placeholder="(201) 555-1111" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 10 }} />

        <Text style={{ color: '#fff', marginBottom: 6 }}>Session</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {SESSION_TYPES.map((s) => (
            <TouchableOpacity key={s} onPress={() => setSession(s)} style={{ borderWidth: 1, borderColor: session === s ? '#fff' : '#444', paddingVertical: 8, paddingHorizontal: 10 }}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: '#fff', marginBottom: 6 }}>Date (e.g. March 30, 2026)</Text>
        <TextInput value={date} onChangeText={setDate} placeholder="March 30, 2026" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 10 }} />
        <Text style={{ color: '#fff', marginBottom: 6 }}>Time (e.g. 10:30 AM)</Text>
        <TextInput value={time} onChangeText={setTime} placeholder="10:30 AM" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 14 }} />

        <TouchableOpacity
          disabled={!canCreate}
          onPress={async () => {
            try {
              const res = await fetch(`${API_BASE}/booking/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, session, date, time }),
              })
              const data = await res.json()
              if (data.success) {
                setCreatedBookingId(data.bookingId || '')
                setBookingId(data.bookingId || '')
                setMessage(`Booked: ${data.bookingId}`)
              } else {
                setMessage(data.error || 'Unable to create booking.')
              }
            } catch {
              setMessage('Network error creating booking.')
            }
          }}
          style={{ backgroundColor: canCreate ? '#fff' : '#444', padding: 14, alignItems: 'center', marginBottom: 12 }}
        >
          <Text style={{ color: '#000', fontWeight: '700' }}>Create Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            try {
              const res = await fetch(`${API_BASE}/booking/lookup?email=${encodeURIComponent(email)}`)
              const data = await res.json()
              setBookings(data.bookings || [])
              setMessage(data.success ? `Found ${data.bookings?.length || 0} bookings` : (data.error || 'Lookup failed'))
            } catch {
              setMessage('Network error during lookup.')
            }
          }}
          style={{ backgroundColor: '#1f2937', padding: 12, alignItems: 'center', marginBottom: 14 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Look Up Bookings</Text>
        </TouchableOpacity>

        <Text style={{ color: '#fff', marginBottom: 6 }}>Booking ID to cancel</Text>
        <TextInput value={bookingId} onChangeText={setBookingId} placeholder="PK-XXXXXX" placeholderTextColor="#777" style={{ borderWidth: 1, borderColor: '#333', color: '#fff', padding: 12, marginBottom: 12 }} />
        <TouchableOpacity
          disabled={!canCancel}
          onPress={async () => {
            try {
              const res = await fetch(`${API_BASE}/booking/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, email }),
              })
              const data = await res.json()
              setMessage(data.success ? 'Booking cancelled successfully.' : (data.error || 'Unable to cancel.'))
            } catch {
              setMessage('Network error. Please try again.')
            }
          }}
          style={{ backgroundColor: canCancel ? '#ef4444' : '#444', padding: 14, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Cancel Booking</Text>
        </TouchableOpacity>

        {createdBookingId ? <Text style={{ color: '#93c5fd', marginTop: 10 }}>Latest booking ID: {createdBookingId}</Text> : null}
        {bookings.length > 0 ? (
          <View style={{ marginTop: 14 }}>
            {bookings.slice(0, 5).map((b) => (
              <Text key={b.bookingId} style={{ color: '#d1d5db', marginBottom: 4 }}>
                {b.bookingId} - {b.session} - {b.date}
              </Text>
            ))}
          </View>
        ) : null}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#9ad08f' }}>{message}</Text>
          <Text style={{ color: '#777', marginTop: 6, fontSize: 12 }}>API: {API_BASE}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
