import ExpoModulesCore
import UIKit

private func edgeInsets(from value: [String: Double]?) -> UIEdgeInsets {
  guard let value else {
    return .zero
  }

  return UIEdgeInsets(
    top: value["top"] ?? 0,
    left: value["left"] ?? 0,
    bottom: value["bottom"] ?? 0,
    right: value["right"] ?? 0
  )
}

public final class SykaMenuModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SykaMenu")

    View(SykaMenuView.self) {
      Events("onPressAction", "onCloseMenu", "onOpenMenu")

      Prop("title") { (view: SykaMenuView, title: String?) in
        view.title = title
      }

      Prop("actions") { (view: SykaMenuView, actions: [NSDictionary]?) in
        view.actions = actions ?? []
      }

      Prop("actionsHash") { (view: SykaMenuView, actionsHash: String?) in
        view.actionsHash = actionsHash
      }

      Prop("shouldOpenOnLongPress") { (view: SykaMenuView, shouldOpenOnLongPress: Bool) in
        view.shouldOpenOnLongPress = shouldOpenOnLongPress
      }

      Prop("themeVariant") { (view: SykaMenuView, themeVariant: String?) in
        view.themeVariant = themeVariant
      }

      Prop("hitSlop") { (view: SykaMenuView, hitSlop: [String: Double]?) in
        view.hitSlop = edgeInsets(from: hitSlop)
      }

      Prop("testID") { (view: SykaMenuView, testID: String?) in
        view.testID = testID
      }

      Prop("accessibilityLabel") { (view: SykaMenuView, label: String?) in
        view.accessibilityLabelText = label
      }

      Prop("accessibilityHint") { (view: SykaMenuView, hint: String?) in
        view.accessibilityHintText = hint
      }
    }
  }
}
