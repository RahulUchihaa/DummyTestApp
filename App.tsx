import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Main from './App/navigation/MainNavigation'
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <SafeAreaProvider>
      <Main />
      <Toast />
    </SafeAreaProvider>
  )
}

export default App