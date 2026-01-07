import ExpoModulesCore
import SwiftUI

struct ListView: ExpoSwiftUI.View {
  @ObservedObject var props: ListProps

  @State private var multiSelection: Set<AnyHashable> = []
  @State private var singleSelection: AnyHashable?
  @State private var prevSelection: Set<AnyHashable> = []
  @State private var editModeEnabled: EditMode = .inactive
  @State private var refreshContinuation: CheckedContinuation<Void, Never>?
  @State private var refreshSeenRefreshingTrue = false

  init(props: ListProps) {
    self.props = props
  }

  var body: some View {
    buildList()
      .onAppear { syncInitialState() }
      .onChange(of: props.editModeEnabled) { newValue in
        withAnimation {
          editModeEnabled = newValue ? .active : .inactive
        }
      }
      .onChange(of: props.refreshing) { newValue in
        handleRefreshingChange(isRefreshing: newValue)
      }
  }

  // MARK: - Initial State

  private func syncInitialState() {
    editModeEnabled = props.editModeEnabled ? .active : .inactive
    syncSelectionFromProps(props.selection)
  }

  private func syncSelectionFromProps(_ selection: [Either<String, Double>]?) {
    guard let selection = selection else { return }
    let hashables = Set(selection.map { getHashableFromEither($0) }.compactMap { $0 })

    // Avoid redundant updates (same pattern as Picker)
    if prevSelection == hashables { return }
    prevSelection = hashables

    switch props.selectionMode {
    case .single:
      singleSelection = hashables.first
    case .multiple:
      multiSelection = hashables
    case .none:
      break
    }
  }

  // MARK: - Helpers

  private func getHashableFromEither(_ either: Either<String, Double>?) -> AnyHashable? {
    guard let either else { return nil }
    if let stringValue: String = either.get() {
      return stringValue
    } else if let doubleValue: Double = either.get() {
      return doubleValue
    }
    return nil
  }

  // MARK: - List Builder

  @ViewBuilder
  private func buildList() -> some View {
    switch props.selectionMode {
    case .single:
      buildSingleSelectionList()
    case .multiple, .none:
      buildMultiSelectionList()
    }
  }

  @ViewBuilder
  private func buildSingleSelectionList() -> some View {
    let list = List(selection: props.selectEnabled ? $singleSelection : nil) {
      listRows
    }
    applyModifiers(to: list)
      .onChange(of: singleSelection) { selection in
        if let selection {
          dispatchSelectionChange([selection])
        } else {
          dispatchSelectionChange([])
        }
      }
  }

  @ViewBuilder
  private func buildMultiSelectionList() -> some View {
    // Must use separate branches - ternary with optional binding breaks multi-selection
    if props.selectEnabled && props.selectionMode == .multiple {
      let list = List(selection: $multiSelection) {
        listRows
      }
      applyModifiers(to: list)
        .onChange(of: multiSelection) { selection in
          dispatchSelectionChange(Array(selection))
        }
    } else {
      let list = List {
        listRows
      }
      applyModifiers(to: list)
    }
  }

  // MARK: - List Rows

  @ViewBuilder
  private var listRows: some View {
    Children()
      .onDelete(perform: handleDelete)
      .onMove(perform: handleMove)
      .deleteDisabled(!props.deleteEnabled)
      .moveDisabled(!props.moveEnabled)
      .modifier(ListSwipeActionsModifier(
        edge: .leading,
        config: props.leadingSwipeActions,
        onAction: handleSwipeAction
      ))
      .modifier(ListSwipeActionsModifier(
        edge: .trailing,
        config: props.trailingSwipeActions,
        onAction: handleSwipeAction
      ))
  }

  // MARK: - Modifiers

  private func applyModifiers<Content: View>(to list: Content) -> some View {
    let styled = list
      .modifier(ListStyleModifier(style: props.listStyle))
      .modifier(ScrollDisabled(disabled: !props.scrollEnabled))
      .environment(\.editMode, $editModeEnabled)

    return applyRefreshable(to: styled)
  }

  @ViewBuilder
  private func applyRefreshable(to list: some View) -> some View {
    if #available(iOS 15.0, *), props.refreshEnabled {
      list.refreshable {
        await handleRefresh()
      }
    } else {
      list
    }
  }

  // MARK: - Event Handlers

  private func handleDelete(at offsets: IndexSet) {
    for offset in offsets {
      props.onDeleteItem(["index": offset])
    }
  }

  private func handleMove(from sources: IndexSet, to destination: Int) {
    for source in sources {
      props.onMoveItem(["from": source, "to": destination])
    }
  }

  private func dispatchSelectionChange(_ selection: [AnyHashable]) {
    let jsonArray: [Any] = selection.compactMap { $0.jsonValue }
    props.onSelectionChange(["selection": jsonArray])
  }

  private func handleSwipeAction(actionId: String, label: String) {
    props.onSwipeAction(["actionId": actionId, "label": label])
  }

  // MARK: - Refresh

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

      if !refreshSeenRefreshingTrue && !props.refreshing {
        Task { @MainActor in
          try? await Task.sleep(nanoseconds: 50_000_000)
          if let cont = refreshContinuation, !refreshSeenRefreshingTrue {
            cont.resume()
            refreshContinuation = nil
          }
        }
      }
    }
  }
}
