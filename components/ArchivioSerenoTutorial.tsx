import React, { useEffect, useState } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BaseColors } from '@/constants/theme';

const TUTORIAL_SEEN_KEY = '@domani_sicuro_tutorial_seen_v2';

// Guardia in-memory: impedisce che il tutorial compaia più volte nella stessa sessione
// se il componente si rimonta (es. per il pre-mount di "(tabs)" come anchor route) prima
// che AsyncStorage abbia registrato la chiusura del primo mount.
let tutorialCheckInFlight = false;
let tutorialShownThisSession = false;

const STEPS = [
  {
    icon: 'doc.fill' as const,
    title: 'Carica i tuoi documenti',
    body: 'Conserva in un unico posto sicuro i documenti importanti: potrai consultarli e aggiornarli quando vuoi.',
  },
  {
    icon: 'exclamationmark.shield.fill' as const,
    title: 'Contatti di emergenza',
    body: 'Aggiungi le persone di fiducia a cui vuoi rendere accessibili i tuoi documenti in caso di bisogno.',
  },
  {
    icon: 'lock.open.fill' as const,
    title: 'Sblocco temporaneo',
    body: 'Dal tab Emergenza puoi attivare lo sblocco temporaneo per dare accesso ai documenti ai tuoi contatti di emergenza, e cercare rapidamente un\'onoranza funebre vicino a te.',
  },
];

interface ArchivioSerenoTutorialProps {
  /** Mostra il tutorial solo quando true (login confermato, profilo caricato). */
  enabled: boolean;
}

/** Tutorial a 3 step mostrato una sola volta al primo accesso a Archivio Sereno, dopo il login. */
export function ArchivioSerenoTutorial({ enabled }: ArchivioSerenoTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled || tutorialShownThisSession || tutorialCheckInFlight) return;
    tutorialCheckInFlight = true;
    AsyncStorage.getItem(TUTORIAL_SEEN_KEY).then(seen => {
      tutorialCheckInFlight = false;
      if (!seen && !tutorialShownThisSession) {
        tutorialShownThisSession = true;
        setVisible(true);
      }
    });
  }, [enabled]);

  const handleClose = () => {
    setVisible(false);
    AsyncStorage.setItem(TUTORIAL_SEEN_KEY, 'true');
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.skip} onPress={handleClose}>
            <ThemedText style={styles.skipText}>Salta</ThemedText>
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <IconSymbol name={current.icon} size={48} color={BaseColors.main} />
          </View>

          <ThemedText type="title" style={styles.title}>{current.title}</ThemedText>
          <ThemedText style={styles.body}>{current.body}</ThemedText>

          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
            <ThemedText style={styles.buttonText}>{isLast ? 'Inizia' : 'Avanti'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  skip: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  skipText: {
    fontSize: 14,
    color: BaseColors.greyMedium,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BaseColors.mainLightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.75,
    lineHeight: 21,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 24,
    marginBottom: 20,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BaseColors.greyLight,
  },
  dotActive: {
    backgroundColor: BaseColors.main,
    width: 18,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BaseColors.main,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
