import ExpoModulesCore
import SwiftUI

internal enum SelectionMode: String, Enumerable {
  case multiple
  case single
  case none
}

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

internal struct RowInsets: Record {
  @Field var top: Double?
  @Field var bottom: Double?
  @Field var leading: Double?
  @Field var trailing: Double?

  func toEdgeInsets() -> EdgeInsets {
    EdgeInsets(
      top: top ?? 0,
      leading: leading ?? 0,
      bottom: bottom ?? 0,
      trailing: trailing ?? 0
    )
  }
}

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
  @Field var selectionMode: SelectionMode = .multiple
  @Field var scrollEnabled: Bool = true
  @Field var editModeEnabled: Bool = false
  @Field var refreshEnabled: Bool = false
  @Field var refreshing: Bool = false
  @Field var showScrollIndicators: Bool = true

  @Field var rowSeparatorVisibility: SeparatorVisibility = .automatic
  @Field var sectionSeparatorVisibility: SeparatorVisibility = .automatic

  @Field var rowInsets: RowInsets?
  @Field var rowBackground: Color?
  @Field var rowSpacing: Double?
  @Field var sectionSpacing: Double?

  // Extra UI behavior
  @Field var rowSeparatorTint: Color?
  @Field var sectionSeparatorTint: Color?
  @Field var hideScrollContentBackground: Bool = false
  @Field var scrollDismissesKeyboard: Bool = false

  @Field var leadingSwipeActions: SwipeActionsConfig?
  @Field var trailingSwipeActions: SwipeActionsConfig?

  var onDeleteItem = EventDispatcher()
  var onMoveItem = EventDispatcher()
  var onSelectionChange = EventDispatcher()
  var onSwipeAction = EventDispatcher()
  var onRefresh = EventDispatcher()
}

struct ListView: ExpoSwiftUI.View {
  @ObservedObject var props: ListProps
  @State private var multiSelection: Set<Int> = []
  @State private var singleSelection: Int?
  @State var editModeEnabled: EditMode = .inactive
  @State var search: String = ""
  @State private var refreshContinuation: CheckedContinuation<Void, Never>?
  @State private var refreshSeenRefreshingTrue = false

  init(props: ListProps) {
    self.props = props
  }

  var body: some View {
    buildList()
  }

  func handleDelete(at offsets: IndexSet) {
    for offset in offsets {
      props.onDeleteItem([
        "index": offset
      ])
      multiSelection.remove(offset)
      if singleSelection == offset {
        singleSelection = nil
      }
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

  func handleSelectionChange(selection: [Int]) {
    let selectionArray = selection
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

  @ViewBuilder
  private func buildList() -> some View {
    switch props.selectionMode {
    case .single:
      let list = List(selection: props.selectEnabled && props.selectionMode != .none ? $singleSelection : nil) {
        listRows
      }
      applyBaseModifiers(list: list)
        .onChange(of: singleSelection) { selection in
          if let selection {
            handleSelectionChange(selection: [selection])
          } else {
            handleSelectionChange(selection: [])
          }
        }

    case .multiple, .none:
      let list = List(selection: props.selectEnabled && props.selectionMode != .none ? $multiSelection : nil) {
        listRows
      }
      applyBaseModifiers(list: list)
        .onChange(of: multiSelection) { selection in
          handleSelectionChange(selection: Array(selection))
        }
    }
  }

  @ViewBuilder
  private var listRows: some View {
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

  private func applyBaseModifiers<Content: View>(list: Content) -> some View {
    let styled = list
      .modifier(ListStyleModifer(style: props.listStyle))
      .onAppear {
        editModeEnabled = props.editModeEnabled ? .active : .inactive
      }
      .onChange(of: props.editModeEnabled) { newValue in
        withAnimation {
          editModeEnabled = newValue ? .active : .inactive
        }
      }
      .onChange(of: props.refreshing) { newValue in
       handleRefreshingChange(isRefreshing: newValue)
      }
      .modifier(ScrollDisabledModifier(scrollEnabled: props.scrollEnabled))
      .environment(\.editMode, $editModeEnabled)

    let refreshed = applyRefreshable(list: styled)
    let chromeApplied = applyListChrome(list: refreshed)
    return applyScrollIndicators(list: chromeApplied)
  }

  private func applyScrollIndicators<Content: View>(list: Content) -> some View {
    if #available(iOS 16.0, tvOS 16.0, *) {
      var modified = list
        .scrollIndicators(props.showScrollIndicators ? .visible : .hidden)
        .scrollDisabled(!props.scrollEnabled)

      if props.scrollDismissesKeyboard {
        modified = modified.scrollDismissesKeyboard(.interactively)
      }

      return AnyView(modified)
    }
    return AnyView(list)
  }

  private func applyListChrome<Content: View>(list: Content) -> some View {
    var view: AnyView = AnyView(list)

    if #available(iOS 15.0, tvOS 15.0, *) {
      let rowVisibility = props.rowSeparatorVisibility.toVisibility()
      let sectionVisibility = props.sectionSeparatorVisibility.toVisibility()

      view = AnyView(
        view
          .listRowSeparator(rowVisibility)
          .listSectionSeparator(sectionVisibility)
      )

      if let tint = props.rowSeparatorTint {
        view = AnyView(view.listRowSeparatorTint(tint))
      }
      if let tint = props.sectionSeparatorTint {
        view = AnyView(view.listSectionSeparatorTint(tint))
      }

      if let insets = props.rowInsets?.toEdgeInsets() {
        view = AnyView(view.listRowInsets(insets))
      }
      if let rowBackground = props.rowBackground {
        view = AnyView(view.listRowBackground(rowBackground))
      }
    }

    if #available(iOS 16.0, tvOS 16.0, *) {
      if props.hideScrollContentBackground {
        view = AnyView(view.scrollContentBackground(.hidden))
      }
      if let spacing = props.rowSpacing {
        view = AnyView(view.listRowSpacing(spacing))
      }
    }

    if #available(iOS 17.0, tvOS 17.0, *) {
      if let spacing = props.sectionSpacing {
        view = AnyView(view.listSectionSpacing(spacing))
      }
    }

    return view
  }

  @ViewBuilder
  private func applyRefreshable(list: some View) -> some View {
    if #available(iOS 15.0, *), props.refreshEnabled {
      list.refreshable {
        await handleRefresh()
      }
    } else {
      list
    }
  }

  private func handleRefreshingChange(isRefreshing: Bool) {
    if isRefreshing {
      refreshSeenRefreshingTrue = true
    } else if refreshSeenRefreshingTrue {
      refreshContinuation?.resume()
      refreshContinuation = nil
      refreshSeenRefreshingTrue = false
    }
  }

  private func handleRefresh() async {
    props.onRefresh([:])

    await withCheckedContinuation { continuation in
      refreshContinuation = continuation
      // If JS chooses not to toggle `refreshing`, end the refresh after a short delay
      if !refreshSeenRefreshingTrue && !props.refreshing {
        Task { @MainActor in
          try? await Task.sleep(nanoseconds: 50_000_000)
          if let continuation = refreshContinuation, !refreshSeenRefreshingTrue {
            continuation.resume()
            refreshContinuation = nil
          }
        }
      }
    }
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

  @ViewBuilder
  func body(content: Content) -> some View {
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
