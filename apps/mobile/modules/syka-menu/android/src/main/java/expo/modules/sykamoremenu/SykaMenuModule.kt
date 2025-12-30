package expo.modules.sykamoremenu

import androidx.core.view.AccessibilityDelegateCompat
import androidx.core.view.ViewCompat
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat
import com.facebook.react.R
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SykaMenuModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SykaMenu")

    View(SykaMenuView::class) {
      Events("onPressAction", "onOpenMenu", "onCloseMenu")

      Prop("actions") { view: SykaMenuView, actions: Array<SykaMenuActionRecord> ->
        view.setActions(actions)
      }

      Prop("actionsHash") { view: SykaMenuView, hash: String? ->
        view.setActionsHash(hash)
      }

      Prop("title") { view: SykaMenuView, title: String? ->
        view.setTitle(title)
      }

      Prop("shouldOpenOnLongPress") { view: SykaMenuView, shouldOpenOnLongPress: Boolean? ->
        view.setIsOpenOnLongPress(shouldOpenOnLongPress == true)
      }

      Prop("hitSlop") { view: SykaMenuView, hitSlop: MenuHitSlop? ->
        view.setHitSlop(hitSlop ?: MenuHitSlop())
      }

      Prop("ripple") { view: SykaMenuView, ripple: MenuRippleConfig? ->
        view.setRippleConfig(ripple ?: MenuRippleConfig())
      }

      Prop("testID") { view: SykaMenuView, testID: String? ->
        view.setTag(R.id.react_test_id, testID)
        view.tag = testID
      }

      Prop("accessibilityLabel") { view: SykaMenuView, label: String? ->
        view.contentDescription = label
      }

      Prop("accessibilityHint") { view: SykaMenuView, hint: String? ->
        ViewCompat.setTooltipText(view, hint)
        if (hint.isNullOrEmpty()) {
          ViewCompat.setAccessibilityDelegate(view, null)
        } else {
          ViewCompat.setAccessibilityDelegate(
            view,
            object : AccessibilityDelegateCompat() {
              override fun onInitializeAccessibilityNodeInfo(
                host: android.view.View,
                info: AccessibilityNodeInfoCompat
              ) {
                super.onInitializeAccessibilityNodeInfo(host, info)
                info.hintText = hint
              }
            }
          )
        }
      }

      AsyncFunction("show") { view: SykaMenuView ->
        view.show()
      }
    }
  }
}
