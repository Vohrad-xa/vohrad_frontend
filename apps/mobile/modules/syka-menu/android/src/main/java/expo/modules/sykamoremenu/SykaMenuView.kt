package expo.modules.sykamoremenu

import android.content.Context
import android.graphics.Rect
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.TouchDelegate
import android.view.ViewGroup
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class SykaMenuView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var actions: Array<SykaMenuActionRecord> = emptyArray()
  private var actionsHash: String? = null
  private var title: String? = null
  private var isAnchoredToRight = false
  private var isMenuDisplayed = false
  private var isOnLongPress = false
  private var hitSlopRect: Rect? = null
  private var menuOverlay: ComposeView? = null
  private var rippleConfig: MenuRippleConfig = MenuRippleConfig()
  private var rippleDrawable: RippleDrawable? = null

  val onPressAction by EventDispatcher<MenuOnPressActionEvent>()
  val onOpenMenu by EventDispatcher<MenuOnOpenEvent>()
  val onCloseMenu by EventDispatcher<MenuOnCloseEvent>()

  private val gestureDetector = GestureDetector(
    context,
    object : GestureDetector.SimpleOnGestureListener() {
      override fun onLongPress(e: MotionEvent) {
        if (isOnLongPress) {
          prepareMenu()
        }
      }

      override fun onSingleTapUp(e: MotionEvent): Boolean {
        if (!isOnLongPress) {
          performClick()
        }
        return true
      }
    }
  )

  init {
    isClickable = true
    isFocusable = true
    setOnClickListener {
      if (!isOnLongPress) {
        prepareMenu()
      }
    }
    rippleDrawable = applyRipple(this, rippleConfig)
  }

  fun show() {
    prepareMenu()
  }

  override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
    return true
  }

  override fun onTouchEvent(ev: MotionEvent): Boolean {
    val rippleEnabled = rippleConfig.enabled
    when (ev.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        if (rippleEnabled) {
          isPressed = true
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            drawableHotspotChanged(ev.x, ev.y)
          }
        }
      }
      MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
        if (rippleEnabled) {
          isPressed = false
        }
      }
    }
    gestureDetector.onTouchEvent(ev)
    return true
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateTouchDelegate()
    updateRippleRadius(rippleDrawable, rippleConfig, w, h)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    updateTouchDelegate()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    dismissMenu()
  }

  fun setActions(actions: Array<SykaMenuActionRecord>) {
    this.actions = actions
  }

  fun setActionsHash(hash: String?) {
    actionsHash = hash
  }

  fun setTitle(title: String?) {
    this.title = title
  }

  fun setIsAnchoredToRight(value: Boolean) {
    isAnchoredToRight = value
  }

  fun setIsOpenOnLongPress(isLongPress: Boolean) {
    isOnLongPress = isLongPress
  }

  fun setHitSlop(hitSlop: MenuHitSlop) {
    hitSlopRect = if (
      hitSlop.top == 0 && hitSlop.bottom == 0 && hitSlop.left == 0 && hitSlop.right == 0
    ) {
      null
    } else {
      Rect(hitSlop.left, hitSlop.top, hitSlop.right, hitSlop.bottom)
    }
    updateTouchDelegate()
  }

  fun setRippleConfig(config: MenuRippleConfig) {
    rippleConfig = config
    rippleDrawable = applyRipple(this, rippleConfig)
    if (!rippleConfig.enabled) {
      isPressed = false
    }
    updateRippleRadius(rippleDrawable, rippleConfig, width, height)
  }

  private fun prepareMenu() {
    if (actions.isEmpty() || isMenuDisplayed) {
      return
    }

    val rootView = rootView as? ViewGroup ?: return
    val anchor = getAnchorBounds()
    val overlay = ComposeView(context).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindow)
      setContent {
        DynamicTheme {
          val submenuTitleColor = MaterialTheme.colorScheme.primary
          SykaDropdownMenu(
            anchor = anchor,
            actions = actions.toList(),
            submenuTitleColor = submenuTitleColor,
            isAnchoredToRight = isAnchoredToRight,
            menuTitle = title,
            onActionSelected = { action ->
              onPressAction(MenuOnPressActionEvent(action.id ?: ""))
              if (action.attributes?.keepsMenuPresented != true) {
                dismissMenu()
              }
            },
            onDismiss = { dismissMenu() }
          )
        }
      }
    }

    rootView.addView(overlay)
    menuOverlay = overlay
    isMenuDisplayed = true
    onOpenMenu(MenuOnOpenEvent())
  }

  private fun dismissMenu() {
    if (!isMenuDisplayed) {
      return
    }

    menuOverlay?.let { overlay ->
      (overlay.parent as? ViewGroup)?.removeView(overlay)
    }
    menuOverlay = null
    isMenuDisplayed = false
    onCloseMenu(MenuOnCloseEvent())
  }

  private fun getAnchorBounds(): MenuAnchor {
    val location = IntArray(2)
    getLocationInWindow(location)
    return MenuAnchor(
      x = location[0],
      y = location[1],
      width = width,
      height = height
    )
  }

  private fun updateTouchDelegate() {
    post {
      val hitRect = Rect()
      getHitRect(hitRect)

      hitSlopRect?.let {
        hitRect.left -= it.left
        hitRect.top -= it.top
        hitRect.right += it.right
        hitRect.bottom += it.bottom
      }

      (parent as? ViewGroup)?.touchDelegate = TouchDelegate(hitRect, this)
    }
  }
}
