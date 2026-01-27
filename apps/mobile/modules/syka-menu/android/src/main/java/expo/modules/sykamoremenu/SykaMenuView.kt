package expo.modules.sykamoremenu

import android.content.Context
import android.content.res.ColorStateList
import android.content.res.Resources
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.text.Spannable
import android.text.SpannableStringBuilder
import android.text.style.ForegroundColorSpan
import android.view.GestureDetector
import android.view.Gravity
import android.view.Menu
import android.view.MenuItem
import android.view.MotionEvent
import android.view.TouchDelegate
import android.view.ViewGroup
import androidx.appcompat.view.ContextThemeWrapper
import androidx.appcompat.widget.PopupMenu
import androidx.core.view.MenuCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.lang.reflect.Field

class SykaMenuView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private var actions: Array<SykaMenuActionRecord> = emptyArray()
  private var actionsHash: String? = null
  private var isAnchoredToRight = false
  private var isMenuDisplayed = false
  private var isOnLongPress = false
  private var popupMenu: PopupMenu? = null
  private var popupMenuContext: Context? = null
  private var hitSlopRect: Rect? = null

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
          prepareMenu()
        }
        return true
      }
    }
  )

  init {
    isClickable = true
  }

  fun show() {
    prepareMenu()
  }

  override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
    return true
  }

  override fun onTouchEvent(ev: MotionEvent): Boolean {
    gestureDetector.onTouchEvent(ev)
    return true
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    updateTouchDelegate()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    updateTouchDelegate()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    if (isMenuDisplayed) {
      popupMenu?.dismiss()
    }
    popupMenu = null
    popupMenuContext = null
  }

  fun setActions(actions: Array<SykaMenuActionRecord>) {
    this.actions = actions
  }

  fun setActionsHash(hash: String?) {
    actionsHash = hash
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

  private fun prepareMenu() {
    if (actions.isEmpty()) {
      return
    }

    val menu = createPopupMenu()
    popupMenu = menu
    menu.menu.clear()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      menu.gravity = if (isAnchoredToRight) Gravity.END else Gravity.START
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      menu.setForceShowIcon(true)
    }

    val submenuTitleColor =
      (popupMenuContext ?: context).getColor(R.color.sykamore_menu_accent)
    addMenuActions(menu.menu, actions, submenuTitleColor)

    menu.setOnDismissListener {
      isMenuDisplayed = false
      onCloseMenu(MenuOnCloseEvent())
    }

    isMenuDisplayed = true
    onOpenMenu(MenuOnOpenEvent())
    menu.show()
  }

  private fun prepareMenuItem(
    menuItem: MenuItem,
    action: SykaMenuActionRecord,
    submenuTitleColor: Int
  ) {
    val titleColor = action.titleColor
    val imageName = action.image
    val imageColor = action.imageColor
    val attributes = action.attributes
    val menuState = action.state
    val isSubmenuTrigger = action.subactions.isNotEmpty()
    val isDestructive = attributes?.destructive == true
    val isDisabled = attributes?.disabled == true

    if (imageName != null) {
      val resourceId: Int = getDrawableIdWithName(imageName)
      if (resourceId != 0) {
        val icon = resources.getDrawable(resourceId, context.theme)
        if (imageColor != null) {
          icon.setTintList(ColorStateList.valueOf(imageColor))
        }
        menuItem.icon = icon
      }
    }

    if (attributes != null) {
      menuItem.isEnabled = !isDisabled
      if (isDisabled) {
        val disabledColor = 0x77888888
        menuItem.icon?.setTintList(ColorStateList.valueOf(disabledColor))
      }

      menuItem.isVisible = !attributes.hidden

      if (isDestructive) {
        menuItem.icon?.setTintList(ColorStateList.valueOf(Color.RED))
      }
    }

    val resolvedTitleColor = when {
      isDestructive -> Color.RED
      isDisabled -> 0x77888888
      titleColor != null -> titleColor
      isSubmenuTrigger -> submenuTitleColor
      else -> null
    }

    if (resolvedTitleColor != null) {
      menuItem.title = getMenuItemTextWithColor(menuItem.title.toString(), resolvedTitleColor)
    }

    when (menuState) {
      "on", "off" -> {
        menuItem.isCheckable = true
        menuItem.isChecked = menuState == "on"
      }

      else -> menuItem.isCheckable = false
    }

    if (action.subactions.isNotEmpty() && menuItem.hasSubMenu()) {
      menuItem.subMenu?.let { subMenu ->
        addMenuActions(subMenu, action.subactions, submenuTitleColor)
      }
    }
  }

  private fun addMenuActions(
    menu: Menu,
    actions: Array<SykaMenuActionRecord>,
    submenuTitleColor: Int
  ) {
    MenuCompat.setGroupDividerEnabled(menu, true)

    var groupId = 0
    var order = 0

    actions.forEach { action ->
      if (action.separator) {
        groupId += 1
        return@forEach
      }

      val menuItem = if (action.subactions.isNotEmpty()) {
        menu.addSubMenu(groupId, Menu.NONE, order, action.title).item
      } else {
        menu.add(groupId, Menu.NONE, order, action.title)
      }

      prepareMenuItem(menuItem, action, submenuTitleColor)

      menuItem.setOnMenuItemClickListener {
        if (!it.hasSubMenu()) {
          isMenuDisplayed = false
          onPressAction(MenuOnPressActionEvent(action.id ?: ""))
          true
        } else {
          false
        }
      }

      order += 1
    }
  }

  private fun createPopupMenu(): PopupMenu {
    val themedContext = ContextThemeWrapper(context, R.style.SykaMenu_PopupMenuOverlay)
    popupMenuContext = themedContext
    return PopupMenu(themedContext, this, Gravity.NO_GRAVITY, 0, R.style.SykaMenu_PopupMenu)
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

  private fun getDrawableIdWithName(name: String): Int {
    val appResources: Resources = context.resources
    var resourceId = appResources.getIdentifier(name, "drawable", context.packageName)
    if (resourceId == 0) {
      resourceId = getResId(name, android.R.drawable::class.java)
    }
    return resourceId
  }

  private fun getResId(resName: String?, c: Class<*>): Int {
    return try {
      val idField: Field = c.getDeclaredField(resName!!)
      idField.getInt(idField)
    } catch (e: Exception) {
      0
    }
  }

  private fun getMenuItemTextWithColor(text: String, color: Int): SpannableStringBuilder {
    val textWithColor = SpannableStringBuilder()
    textWithColor.append(text)
    textWithColor.setSpan(
      ForegroundColorSpan(color),
      0,
      text.length,
      Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
    )
    return textWithColor
  }
}
