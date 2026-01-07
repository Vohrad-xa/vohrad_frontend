import ExpoModulesCore
import SwiftUI

// MARK: - Scroll Modifiers

/**
 * Controls visibility of scroll indicators in scrollable views.
 * @platform iOS 16.0+, tvOS 16.0+
 */
internal struct ScrollIndicators: ViewModifier, Record {
  @Field var visible: Bool = true

  @ViewBuilder
  func body(content: Content) -> some View {
    if #available(iOS 16.0, tvOS 16.0, *) {
      content.scrollIndicators(visible ? .visible : .hidden)
    } else {
      content
    }
  }
}

/**
 * Controls whether scrolling is enabled in scrollable views.
 * @platform iOS 16.0+, tvOS 16.0+
 */
internal struct ScrollDisabled: ViewModifier, Record {
  @Field var disabled: Bool = false

  @ViewBuilder
  func body(content: Content) -> some View {
    if #available(iOS 16.0, tvOS 16.0, *) {
      content.scrollDisabled(disabled)
    } else {
      content
    }
  }
}

internal enum ScrollDismissesKeyboardMode: String, Enumerable {
  case automatic
  case never
  case interactively
  case immediately
}

/**
 * Controls how the keyboard is dismissed when scrolling.
 * @platform iOS 16.0+
 */
internal struct ScrollDismissesKeyboard: ViewModifier, Record {
  @Field var mode: ScrollDismissesKeyboardMode = .automatic

  @ViewBuilder
  func body(content: Content) -> some View {
    #if os(tvOS)
      content
    #else
      if #available(iOS 16.0, *) {
        switch mode {
        case .automatic:
          content.scrollDismissesKeyboard(.automatic)
        case .never:
          content.scrollDismissesKeyboard(.never)
        case .interactively:
          content.scrollDismissesKeyboard(.interactively)
        case .immediately:
          content.scrollDismissesKeyboard(.immediately)
        }
      } else {
        content
      }
    #endif
  }
}

internal enum ScrollContentBackgroundVisibility: String, Enumerable {
  case automatic
  case hidden
  case visible
}

/**
 * Controls the visibility of the background for scrollable views.
 * @platform iOS 16.0+
 */
internal struct ScrollContentBackground: ViewModifier, Record {
  @Field var visible: ScrollContentBackgroundVisibility = .visible

  @ViewBuilder
  func body(content: Content) -> some View {
    #if os(tvOS)
      content
    #else
      if #available(iOS 16.0, *) {
        switch visible {
        case .visible:
          content.scrollContentBackground(.visible)
        case .hidden:
          content.scrollContentBackground(.hidden)
        case .automatic:
          content.scrollContentBackground(.automatic)
        }
      } else {
        content
      }
    #endif
  }
}
