import ExpoModulesCore
import SwiftUI

// MARK: - List Types

internal enum SeparatorVisibility: String, Enumerable {
  case automatic
  case visible
  case hidden

  func toVisibility() -> Visibility {
    switch self {
    case .automatic:
      return .automatic
    case .visible:
      return .visible
    case .hidden:
      return .hidden
    }
  }
}

internal enum VerticalEdgeOptions: String, Enumerable {
  case all
  case top
  case bottom

  func toVerticalEdges() -> VerticalEdge.Set {
    switch self {
    case .all:
      return .all
    case .top:
      return .top
    case .bottom:
      return .bottom
    }
  }
}

// MARK: - List Section Modifiers

internal enum ListSectionSpacingType: String, Enumerable {
  case `default`
  case compact
  case custom
}

/**
 * Sets the spacing between adjacent sections in a List.
 * @platform iOS 17.0+
 */
internal struct ListSectionSpacing: ViewModifier, Record {
  @Field var spacing: ListSectionSpacingType = .default
  @Field var value: CGFloat = 0

  @ViewBuilder
  func body(content: Content) -> some View {
    #if os(tvOS)
      content
    #else
      if #available(iOS 17.0, *) {
        switch spacing {
        case .compact:
          content.listSectionSpacing(.compact)
        case .custom:
          content.listSectionSpacing(value)
        default:
          content.listSectionSpacing(.default)
        }
      } else {
        content
      }
    #endif
  }
}

/**
 * Controls the visibility and tint of separators between sections in a List.
 * @platform iOS 15.0+
 */
internal struct ListSectionSeparator: ViewModifier, Record {
  @Field var visibility: SeparatorVisibility = .automatic
  @Field var tint: Color?

  @ViewBuilder
  func body(content: Content) -> some View {
    #if os(tvOS)
      content
    #else
      if #available(iOS 15.0, *) {
        if let tint = tint {
          content
            .listSectionSeparator(visibility.toVisibility())
            .listSectionSeparatorTint(tint)
        } else {
          content.listSectionSeparator(visibility.toVisibility())
        }
      } else {
        content
      }
    #endif
  }
}

/**
 * Sets the margins for sections in a List.
 * Supports per-edge lengths for fine-grained control.
 * @platform iOS 26.0+
 */
internal struct ListSectionMargins: ViewModifier, Record {
  @Field var top: CGFloat?
  @Field var bottom: CGFloat?
  @Field var leading: CGFloat?
  @Field var trailing: CGFloat?
  @Field var horizontal: CGFloat?
  @Field var vertical: CGFloat?
  @Field var all: CGFloat?

  @ViewBuilder
  func body(content: Content) -> some View {
    #if compiler(>=6.2) && !os(tvOS)
      if #available(iOS 26.0, *) {
        content
          .applyIf(all != nil) { $0.listSectionMargins(.all, all!) }
          .applyIf(horizontal != nil) { $0.listSectionMargins(.horizontal, horizontal!) }
          .applyIf(vertical != nil) { $0.listSectionMargins(.vertical, vertical!) }
          .applyIf(top != nil) { $0.listSectionMargins(.top, top!) }
          .applyIf(bottom != nil) { $0.listSectionMargins(.bottom, bottom!) }
          .applyIf(leading != nil) { $0.listSectionMargins(.leading, leading!) }
          .applyIf(trailing != nil) { $0.listSectionMargins(.trailing, trailing!) }
      } else {
        content
      }
    #else
      content
    #endif
  }
}

// MARK: - List Row Modifiers

/**
 * Controls the visibility of the separator for a List row.
 */
internal struct ListRowSeparator: ViewModifier, Record {
  @Field var visibility: SeparatorVisibility = .automatic
  @Field var edges: VerticalEdgeOptions?

  @ViewBuilder
  func body(content: Content) -> some View {
    #if os(tvOS)
      content
    #else
      if let edges = edges {
        content.listRowSeparator(visibility.toVisibility(), edges: edges.toVerticalEdges())
      } else {
        content.listRowSeparator(visibility.toVisibility())
      }
    #endif
  }
}

/**
 * Sets the background of a List row.
 */
internal struct ListRowBackground: ViewModifier, Record {
  @Field var color: Color?

  @ViewBuilder
  func body(content: Content) -> some View {
    if let color = color {
      content.listRowBackground(color)
    } else {
      content
    }
  }
}

/**
 * Applies insets to rows in a List.
 */
internal struct ListRowInsets: ViewModifier, Record {
  @Field var top: CGFloat = 0
  @Field var leading: CGFloat = 0
  @Field var bottom: CGFloat = 0
  @Field var trailing: CGFloat = 0

  @ViewBuilder
  func body(content: Content) -> some View {
    if top != 0 || leading != 0 || bottom != 0 || trailing != 0 {
      content.listRowInsets(.init(
        top: top,
        leading: leading,
        bottom: bottom,
        trailing: trailing
      ))
    } else {
      content
    }
  }
}
