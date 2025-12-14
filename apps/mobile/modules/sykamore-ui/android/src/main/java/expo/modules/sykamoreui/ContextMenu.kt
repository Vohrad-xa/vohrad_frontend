package expo.modules.sykamoreui

import android.content.Context
import android.view.GestureDetector
import android.view.MotionEvent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.material3.DropdownMenuPopup
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoComposeView
import expo.modules.kotlin.views.ComposableScope

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
class ContextMenu(context: Context, appContext: AppContext) :
  ExpoComposeView<ContextMenuProps>(context, appContext, withHostingView = true) {

  override val props = ContextMenuProps()
  private val expanded = mutableStateOf(false)

  private val gestureDetector = GestureDetector(
    context,
    object : GestureDetector.SimpleOnGestureListener() {
      override fun onDown(e: MotionEvent): Boolean {
        if (props.activationMethod.value == ActivationMethod.SINGLE_PRESS) {
          expanded.value = !expanded.value
        }
        return super.onDown(e)
      }

      override fun onLongPress(e: MotionEvent) {
        if (props.activationMethod.value == ActivationMethod.LONG_PRESS) {
          expanded.value = !expanded.value
        }
        super.onLongPress(e)
      }
    }
  )

  override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
    ev?.let {
      gestureDetector.onTouchEvent(ev)
    }
    return super.dispatchTouchEvent(ev)
  }

  @Composable
  override fun ComposableScope.Content() {
    var triggerView: ExpoComposeView<*>? = null
    var contentView: ExpoComposeView<*>? = null

    // Find child views
    for (index in 0 until this@ContextMenu.size) {
      when (val child = getChildAt(index)) {
        is ContextMenuActivationElement -> triggerView = child
        is ContextMenuContent -> contentView = child
      }
    }

    Box(modifier = Modifier.wrapContentSize(Alignment.TopStart)) {
      // Render trigger
      triggerView?.let { trigger ->
        with(this@Content) {
          with(trigger) {
            Content()
          }
        }
      }

      // Render dropdown menu using expressive API
      DynamicTheme {
        DropdownMenuPopup(
          expanded = expanded.value,
          onDismissRequest = {
            expanded.value = false
          },
          modifier = Modifier.wrapContentSize(Alignment.TopStart)
        ) {
          contentView?.let { content ->
            with(this@Content) {
              with(content) {
                Content()
              }
            }
          }
        }
      }
    }
  }
}

class ContextMenuActivationElement(context: Context, appContext: AppContext) :
  ExpoComposeView<ContextMenuActivationElementProps>(context, appContext, withHostingView = true) {

  override val props = ContextMenuActivationElementProps()

  @Composable
  override fun ComposableScope.Content() {
    Box {
      for (index in 0 until this@ContextMenuActivationElement.size) {
        val child = getChildAt(index) as? ExpoComposeView<*> ?: continue
        with(this@Content) {
          with(child) {
            Content()
          }
        }
      }
    }
  }
}

class ContextMenuContent(context: Context, appContext: AppContext) :
  ExpoComposeView<ContextMenuContentProps>(context, appContext, withHostingView = true) {

  override val props = ContextMenuContentProps()

  @Composable
  override fun ComposableScope.Content() {
    for (index in 0 until this@ContextMenuContent.size) {
      val child = getChildAt(index) as? ExpoComposeView<*> ?: continue
      with(this@Content) {
        with(child) {
          Content()
        }
      }
    }
  }
}

class ContextMenuPreview(context: Context, appContext: AppContext) :
  ExpoComposeView<ContextMenuPreviewProps>(context, appContext, withHostingView = true) {

  override val props = ContextMenuPreviewProps()

  @Composable
  override fun ComposableScope.Content() {
    // Preview is iOS-specific, render children for compatibility but no preview effect on Android
    for (index in 0 until this@ContextMenuPreview.size) {
      val child = getChildAt(index) as? ExpoComposeView<*> ?: continue
      with(this@Content) {
        with(child) {
          Content()
        }
      }
    }
  }
}
