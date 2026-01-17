import ExpoModulesCore
import SwiftUI

// MARK: - FontWeight

internal enum FontWeight: String, Enumerable {
  case ultraLight, thin, light, regular, medium, semibold, bold, heavy, black

  func toSwiftUI() -> Font.Weight {
    switch self {
    case .ultraLight: .ultraLight
    case .thin: .thin
    case .light: .light
    case .regular: .regular
    case .medium: .medium
    case .semibold: .semibold
    case .bold: .bold
    case .heavy: .heavy
    case .black: .black
    }
  }
}

// MARK: - FontDesign

internal enum FontDesign: String, Enumerable {
  case `default`, rounded, serif, monospaced

  func toSwiftUI() -> Font.Design {
    switch self {
    case .default: .default
    case .rounded: .rounded
    case .serif: .serif
    case .monospaced: .monospaced
    }
  }
}

// MARK: - TextStyleOption

internal enum TextStyleOption: String, Enumerable {
  case largeTitle, title1, title2, title3
  case headline, subheadline, body, callout
  case footnote, caption, caption2

  func toSwiftUI() -> Font.TextStyle {
    switch self {
    case .largeTitle: .largeTitle
    case .title1: .title
    case .title2: .title2
    case .title3: .title3
    case .headline: .headline
    case .subheadline: .subheadline
    case .body: .body
    case .callout: .callout
    case .footnote: .footnote
    case .caption: .caption
    case .caption2: .caption2
    }
  }

  func toFont(weight: Font.Weight, design: Font.Design) -> Font {
    if #available(iOS 16.0, *) {
      return .system(toSwiftUI(), design: design, weight: weight)
    } else {
      return .system(toSwiftUI(), design: design)
    }
  }
}

// MARK: - FontModifier

internal struct FontModifier: ViewModifier, Record {
  @Field var family: String?
  @Field var size: CGFloat?
  @Field var weight: FontWeight?
  @Field var design: FontDesign?
  @Field var textStyle: TextStyleOption?

  @ViewBuilder
  func body(content: Content) -> some View {
    let fontWeight = weight?.toSwiftUI() ?? .regular
    let fontDesign = design?.toSwiftUI() ?? .default

    if let family {
      if let textStyle {
        content.font(.custom(family, size: size ?? 17, relativeTo: textStyle.toSwiftUI()))
      } else {
        content.font(.custom(family, size: size ?? 17))
      }
    } else if let textStyle {
      content.font(textStyle.toFont(weight: fontWeight, design: fontDesign))
    } else if let size {
      content.font(.system(size: size, weight: fontWeight, design: fontDesign))
    } else {
      content.font(TextStyleOption.body.toFont(weight: fontWeight, design: fontDesign))
    }
  }
}
