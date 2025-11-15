
"use client"

export default function Master3Page() {
  const fetchProtectedData = async () => {
    try {
      const response = await fetch('/api/protected')
      if (!response.ok) {
        throw new Error('API request failed')
      }
      await response.json()
    } catch (error) {
      console.error('Error fetching protected data:', error)
    }
  }

  const sendProtectedData = async () => {
    try {
      const response = await fetch('/api/protected/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          someData: 'example'
        })
      })
      if (!response.ok) {
        throw new Error('API request failed')
      }
      await response.json()
    } catch (error) {
      console.error('Error sending data:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Master3</h1>
      <button onClick={fetchProtectedData}>Get Protected Data</button><br />
      <br />
      <button onClick={sendProtectedData}>Send Protected Data</button><br />
    </div>
  )
}