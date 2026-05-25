import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { BaseColors } from '@/constants/theme';

export type LoadingState = 
  | 'initializing'
  | 'loading_storage' 
  | 'validating_token'
  | 'loading_profile'
  | 'completing'
  | 'timeout'
  | 'error';

interface LoadingScreenProps {
  loadingState: LoadingState;
  error?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ loadingState, error }) => {
  const [dots, setDots] = useState('');

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getLoadingMessage = (): string => {
    switch (loadingState) {
      case 'initializing':
        return 'Avvio dell\'applicazione';
      case 'loading_storage':
        return 'Caricamento dati locali';
      case 'validating_token':
        return 'Verifica credenziali';
      case 'loading_profile':
        return 'Caricamento profilo utente';
      case 'completing':
        return 'Completamento accesso';
      case 'timeout':
        return 'Connessione lenta, continuiamo offline';
      case 'error':
        return error || 'Si è verificato un errore';
      default:
        return 'Caricamento';
    }
  };

  const getSubMessage = (): string => {
    switch (loadingState) {
      case 'initializing':
        return 'Preparazione componenti...';
      case 'loading_storage':
        return 'Recupero delle tue preferenze...';
      case 'validating_token':
        return 'Controllo della sessione...';
      case 'loading_profile':
        return 'Sincronizzazione dei tuoi dati...';
      case 'completing':
        return 'Quasi pronto...';
      case 'timeout':
        return 'Procederemo con i dati in cache';
      case 'error':
        return 'Riprova o contatta il supporto';
      default:
        return '';
    }
  };

  const shouldShowSpinner = loadingState !== 'error' && loadingState !== 'timeout';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon area */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-horizontal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Loading content */}
        <View style={styles.loadingContainer}>
          {shouldShowSpinner && (
            <ActivityIndicator 
              size="large" 
              color={BaseColors.main} 
              style={styles.spinner}
            />
          )}
          
          <Text style={styles.mainMessage}>
            {getLoadingMessage()}{dots}
          </Text>
          
          {getSubMessage() && (
            <Text style={styles.subMessage}>
              {getSubMessage()}
            </Text>
          )}

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: getProgressWidth(loadingState)
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const getProgressWidth = (state: LoadingState): string => {
  switch (state) {
    case 'initializing':
      return '10%';
    case 'loading_storage':
      return '30%';
    case 'validating_token':
      return '60%';
    case 'loading_profile':
      return '85%';
    case 'completing':
      return '95%';
    case 'timeout':
    case 'error':
      return '100%';
    default:
      return '0%';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColors.white,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 62,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  spinner: {
    marginBottom: 24,
  },
  mainMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: BaseColors.mainDark, // Marrone scuro per contrasto
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: BaseColors.greyMedium, // Grigio medio per sottotesto
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: BaseColors.mainLight, // Background della progress bar
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BaseColors.main, // Fill della progress bar nel colore principale
    borderRadius: 2,
  },
});

export default LoadingScreen;
