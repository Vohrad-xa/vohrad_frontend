// Copyright 2025-present 650 Industries. All rights reserved.

import SwiftUI
import ExpoModulesCore

// MARK: - Toolbar Placement

internal enum ToolbarPlacementType: String, Enumerable {
  case automatic
  case principal
  case navigation
  case primaryAction
  case secondaryAction
  case status
  case confirmationAction
  case cancellationAction
  case destructiveAction
  case navigationBarLeading
  case navigationBarTrailing
  case topBarLeading
  case topBarTrailing
  case bottomBar
  case keyboard

  @available(iOS 14.0, macOS 11.0, tvOS 14.0, *)
  func toToolbarItemPlacement() -> ToolbarItemPlacement {
    switch self {
    case .principal:
      return .principal
    case .navigation:
      return .navigation
    case .primaryAction:
      return .primaryAction
    case .secondaryAction:
      return .secondaryAction
    case .status:
      return .status
    case .confirmationAction:
      return .confirmationAction
    case .cancellationAction:
      return .cancellationAction
    case .destructiveAction:
      return .destructiveAction
    case .navigationBarLeading:
      #if os(iOS)
      return .navigationBarLeading
      #else
      return .automatic
      #endif
    case .navigationBarTrailing:
      #if os(iOS)
      return .navigationBarTrailing
      #else
      return .automatic
      #endif
    case .topBarLeading:
      if #available(iOS 17.0, macOS 14.0, tvOS 17.0, *) {
        return .topBarLeading
      } else {
        return .automatic
      }
    case .topBarTrailing:
      if #available(iOS 17.0, macOS 14.0, tvOS 17.0, *) {
        return .topBarTrailing
      } else {
        return .automatic
      }
    case .bottomBar:
      return .bottomBar
    case .keyboard:
      #if !os(tvOS)
      return .keyboard
      #else
      return .automatic
      #endif
    case .automatic:
      return .automatic
    }
  }
}

// MARK: - ToolbarItem Component

internal final class ToolbarItemProps: ExpoSwiftUI.ViewProps {
  @Field var placement: ToolbarPlacementType = .automatic
}

internal final class ToolbarGroupProps: ExpoSwiftUI.ViewProps {
  @Field var placement: ToolbarPlacementType = .automatic
}

internal final class ToolbarProps: ExpoSwiftUI.ViewProps {}

internal struct ToolbarItemView: ExpoSwiftUI.View {
  @ObservedObject var props: ToolbarItemProps

  var body: some View {
    Children()
  }
}

internal struct ToolbarGroupView: ExpoSwiftUI.View {
  @ObservedObject var props: ToolbarGroupProps

  var body: some View {
    Children()
  }
}

// MARK: - Toolbar View

internal struct ToolbarView: ExpoSwiftUI.View {
  @ObservedObject var props: ToolbarProps

  var body: some View {
    Group {
      if #available(iOS 14.0, macOS 11.0, tvOS 14.0, *) {
        Color.clear
          .frame(width: 0, height: 0)
          .toolbar {
            ForEach(Array(toolbarItems.enumerated()), id: \.offset) { _, item in
              switch item {
              case .item(let data):
                SwiftUI.ToolbarItem(placement: data.placement) {
                  data.content
                }
              case .group(let data):
                SwiftUI.ToolbarItemGroup(placement: data.placement) {
                  data.content()
                }
              }
            }
          }
          .accessibilityHidden(true)
      } else {
        Color.clear.frame(width: 0, height: 0)
      }
    }
  }

  private struct ToolbarItemData {
    let placement: ToolbarItemPlacement
    let content: AnyView
  }

  private struct ToolbarGroupData {
    let placement: ToolbarItemPlacement
    let content: () -> AnyView
  }

  private enum ToolbarContentEntry {
    case item(ToolbarItemData)
    case group(ToolbarGroupData)
  }

  private var toolbarItems: [ToolbarContentEntry] {
    guard let children = props.children else {
      return []
    }

    return children.compactMap { child -> ToolbarContentEntry? in
      if let toolbarItem = child.childView as? ToolbarItemView {
        let data = ToolbarItemData(
          placement: toolbarItem.props.placement.toToolbarItemPlacement(),
          content: AnyView(toolbarItem)
        )
        return .item(data)
      }

      if let group = child.childView as? ToolbarGroupView {
        let data = ToolbarGroupData(
          placement: group.props.placement.toToolbarItemPlacement(),
          content: { AnyView(group) }
        )
        return .group(data)
      }

      return nil
    }
  }
}
