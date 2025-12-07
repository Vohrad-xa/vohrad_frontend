import ExpoModulesCore
import SwiftUI

/** Button role for swipe actions */
internal enum SwipeActionRole: String, Enumerable {
  case `default`
  case destructive
  case cancel

  func toNativeRole() -> SwiftUI.ButtonRole? {
    switch self {
    case .default:
      return nil
    case .destructive:
      return SwiftUI.ButtonRole.destructive
    case .cancel:
      return SwiftUI.ButtonRole.cancel
    }
  }
}

/** Single swipe action configuration */
internal struct SwipeActionConfig: Record {
  @Field var id: String = ""
  @Field var label: String = ""
  @Field var systemImage: String?
  @Field var role: SwipeActionRole = .default
  @Field var tint: Color?
}

/** Swipe actions configuration for an edge */
internal struct SwipeActionsConfig: Record {
  @Field var actions: [SwipeActionConfig] = []
  @Field var allowsFullSwipe: Bool = true
}

final class ListProps: UIBaseViewProps {
  @Field var listStyle: String = "automatic"
  @Field var moveEnabled: Bool = false
  @Field var deleteEnabled: Bool = false
  @Field var selectEnabled: Bool = true
  @Field var scrollEnabled: Bool = true
  @Field var editModeEnabled: Bool = false
  @Field var leadingSwipeActions: SwipeActionsConfig?
  @Field var trailingSwipeActions: SwipeActionsConfig?
  var onDeleteItem = EventDispatcher()
  var onMoveItem = EventDispatcher()
  var onSelectionChange = EventDispatcher()
  var onSwipeAction = EventDispatcher()
}

struct ListView: ExpoSwiftUI.View {
  @ObservedObject var props: ListProps
  @State private var selection: Set<Int> = []
  @State var editModeEnabled: EditMode = .inactive
  @State var search: String = ""

  init(props: ListProps) {
    self.props = props
  }

  var body: some View {
    let list = List(selection: props.selectEnabled ? $selection : nil) {
      Children()
        .onDelete(perform: handleDelete)
        .onMove(perform: handleMove)
        .deleteDisabled(!props.deleteEnabled)
        .moveDisabled(!props.moveEnabled)
        .modifier(LeadingSwipeActionsModifier(
          config: props.leadingSwipeActions,
          onAction: handleSwipeAction
        ))
        .modifier(TrailingSwipeActionsModifier(
          config: props.trailingSwipeActions,
          onAction: handleSwipeAction
        ))
    }
      .modifier(ListStyleModifer(style: props.listStyle))
      .onAppear {
        editModeEnabled = props.editModeEnabled ? .active : .inactive
      }
      .onChange(of: props.editModeEnabled) { newValue in
        withAnimation {
          editModeEnabled = newValue ? .active : .inactive
        }
      }
      .onChange(of: selection) { selection in
        handleSelectionChange(selection: selection)
      }
      .modifier(ScrollDisabledModifier(scrollEnabled: props.scrollEnabled))
      .environment(\.editMode, $editModeEnabled)
    if #available(iOS 16.0, tvOS 16.0, *) {
      list.scrollDisabled(!props.scrollEnabled)
    } else {
      list
    }
  }
  func handleDelete(at offsets: IndexSet) {
    for offset in offsets {
      props.onDeleteItem([
        "index": offset
      ])
      selection.remove(offset)
    }
  }
  func handleMove(from sources: IndexSet, to destination: Int) {
    for source in sources {
      props.onMoveItem([
        "from": source,
        "to": destination
      ])
    }
  }
  func handleSelectionChange(selection: Set<Int>) {
    let selectionArray = Array(selection)
    let jsonDict: [String: Any] = [
      "selection": selectionArray
    ]
    props.onSelectionChange(jsonDict)
  }

  func handleSwipeAction(actionId: String, label: String) {
    props.onSwipeAction([
      "actionId": actionId,
      "label": label
    ])
  }
}

/** Modifier for leading edge swipe actions */
struct LeadingSwipeActionsModifier: ViewModifier {
  let config: SwipeActionsConfig?
  let onAction: (String, String) -> Void

  func body(content: Content) -> some View {
    if #available(iOS 15.0, *), let config = config, !config.actions.isEmpty {
      content.swipeActions(edge: .leading, allowsFullSwipe: config.allowsFullSwipe) {
        ForEach(config.actions, id: \.id) { action in
          SwiftUI.Button(role: action.role.toNativeRole()) {
            onAction(action.id, action.label)
          } label: {
            if let systemImage = action.systemImage, !systemImage.isEmpty {
              Label(action.label, systemImage: systemImage)
            } else {
              Text(action.label)
            }
          }
          .tint(action.tint)
        }
      }
    } else {
      content
    }
  }
}

/** Modifier for trailing edge swipe actions */
struct TrailingSwipeActionsModifier: ViewModifier {
  let config: SwipeActionsConfig?
  let onAction: (String, String) -> Void

  func body(content: Content) -> some View {
    if #available(iOS 15.0, *), let config = config, !config.actions.isEmpty {
      content.swipeActions(edge: .trailing, allowsFullSwipe: config.allowsFullSwipe) {
        ForEach(config.actions, id: \.id) { action in
          SwiftUI.Button(role: action.role.toNativeRole()) {
            onAction(action.id, action.label)
          } label: {
            if let systemImage = action.systemImage, !systemImage.isEmpty {
              Label(action.label, systemImage: systemImage)
            } else {
              Text(action.label)
            }
          }
          .tint(action.tint)
        }
      }
    } else {
      content
    }
  }
}

struct ListStyleModifer: ViewModifier {
  var style: String
  @ViewBuilder func body(content: Content) -> some View {
    switch style {
    case "grouped":
      content.listStyle(.grouped)
    case "insetGrouped":
    #if !os(tvOS)
      content.listStyle(.insetGrouped)
    #endif
    case "inset":
    #if !os(tvOS)
      content.listStyle(.inset)
    #endif
    case "plain":
      content.listStyle(.plain)
    case "sidebar":
    #if !os(tvOS)
      content.listStyle(.sidebar)
    #endif
    case "automatic":
      content.listStyle(.automatic)
    default:
      content
    }
  }
}

struct ScrollDisabledModifier: ViewModifier {
  let scrollEnabled: Bool

  func body(content: Content) -> some View {
    if #available(iOS 16.0, tvOS 16.0, *) {
      content.scrollDisabled(!scrollEnabled)
    } else {
      content
    }
  }
}
