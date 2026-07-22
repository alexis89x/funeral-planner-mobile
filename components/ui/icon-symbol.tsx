// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type SymbolName = Extract<SymbolViewProps['name'], string>;
type IconMapping = Record<SymbolName, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof IconMapping;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Original mappings
  'home': 'home',
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',

  // Tab bar icons
  'magnifyingglass': 'search',
  'bag.fill': 'shopping-bag',
  'list.bullet': 'list',
  'ellipsis.circle.fill': 'more-horiz',
  'building.2.fill': 'business',
  'person.fill': 'person',

  // Service icons
  'heart.fill': 'favorite',
  'calendar': 'calendar-today',
  'doc.text.fill': 'description',
  'doc.fill': 'insert-drive-file',
  'info.circle.fill': 'info',
  'gearshape.fill': 'settings',
  'envelope.fill': 'email',
  'star.fill': 'star',
  'bookmark.fill': 'bookmark',
  'circle.fill': 'circle',
  'seal.fill': 'verified',

  // Action icons
  'rectangle.portrait.and.arrow.right': 'logout',
  'trash': 'delete',
  'minus.circle.fill': 'remove-circle',
  'arrow.clockwise': 'refresh',

  // Emergenza icons
  'exclamationmark.shield.fill': 'warning',
  'phone.fill': 'phone',

  // FAQ / Help
  'questionmark.circle.fill': 'help',
  'play.circle.fill': 'play-circle-filled',

  // Altro screen
  'rectangle.portrait.and.arrow.left': 'logout',

  // Emergency contacts
  'pencil': 'edit',
  'plus': 'add',
  'chevron.down': 'keyboard-arrow-down',
  'checkmark': 'check',
  'person.2.fill': 'group',

  // File / uploads
  'arrow.up.doc.fill': 'upload-file',
  'photo.fill': 'image',
  'doc.richtext.fill': 'picture-as-pdf',
  'film.fill': 'videocam',
  'music.note': 'music-note',
  'doc.zipper': 'folder-zip',
  'lock.fill': 'lock',
  'lock.open.fill': 'lock-open',
  'eye.fill': 'visibility',

  // Upgrade / storage
  'externaldrive.fill.badge.plus': 'storage',
  'arrow.triangle.2.circlepath': 'swap-horiz',
  'exclamationmark.triangle.fill': 'warning',
  'square.and.arrow.up': 'share',
} as unknown as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
