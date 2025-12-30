package expo.modules.sykamoremenu

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.drawable.Drawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.util.Log
import android.util.TypedValue
import android.view.View
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.icons.Icons
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import java.util.Locale
import kotlin.math.min

/**
 * Gets the ImageVector for a given icon name using reflection.
 */
fun getImageVector(icon: String?): ImageVector? {
  if (icon.isNullOrEmpty()) return null
  return try {
    val parts = icon.split(".")
    if (parts.size != 2) return null
    val theme = parts[0].lowercase(Locale.US)
    val name = parts[1]
    val group = when (theme) {
      "filled" -> Icons.Filled
      "outlined" -> Icons.Outlined
      "rounded" -> Icons.Rounded
      "sharp" -> Icons.Sharp
      "twotone" -> Icons.TwoTone
      else -> return null
    }
    val clazz = Class.forName("androidx.compose.material.icons.$theme.${name}Kt")
    val method = clazz.getDeclaredMethod("get$name", group::class.java)
    method.invoke(null, group) as? ImageVector
  } catch (e: Exception) {
    Log.w("SykaMenu", "The icon $icon couldn't be found.")
    null
  }
}

@Composable
fun DynamicTheme(content: @Composable () -> Unit) {
  val context = LocalContext.current
  val colors = when {
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
      if (isSystemInDarkTheme()) {
        dynamicDarkColorScheme(context)
      } else {
        dynamicLightColorScheme(context)
      }
    }
    isSystemInDarkTheme() -> darkColorScheme()
    else -> lightColorScheme()
  }

  val shapes = Shapes(
    extraSmall = RoundedCornerShape(UiShapeRadius),
    small = RoundedCornerShape(UiShapeRadius),
    medium = RoundedCornerShape(UiShapeRadius),
    large = RoundedCornerShape(UiShapeRadius),
    extraLarge = RoundedCornerShape(UiShapeRadius)
  )

  MaterialTheme(colorScheme = colors, shapes = shapes) {
    content()
  }
}

/**
 * Resolves the icon color based on action attributes.
 */
fun resolveIconColor(
  action: SykaMenuActionRecord,
  isSubmenuTrigger: Boolean,
  destructiveColor: Color
): Color? {
  val isDisabled = action.attributes?.disabled == true
  val isDestructive = action.attributes?.destructive == true ||
    (isSubmenuTrigger && action.menuOptions?.destructive == true)
  val imageColor = action.imageColor?.let { Color(it) }

  return when {
    isDisabled -> null
    isDestructive -> destructiveColor
    imageColor != null -> imageColor
    else -> null
  }
}

enum class MenuRippleMode {
  AUTO,
  CIRCLE,
  BOUNDED
}

fun applyRipple(view: View, config: MenuRippleConfig): RippleDrawable? {
  if (!config.enabled || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
    clearRipple(view)
    return null
  }

  val mode = resolveRippleMode(config.mode)
  val borderless = mode != MenuRippleMode.BOUNDED
  val cornerRadius = if (mode == MenuRippleMode.BOUNDED) {
    config.cornerRadius
  } else {
    null
  }
  val drawable = buildRippleDrawable(view.context, borderless, cornerRadius)
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    view.foreground = drawable
  } else {
    view.background = drawable
  }
  return drawable as? RippleDrawable
}

fun updateRippleRadius(
  drawable: RippleDrawable?,
  config: MenuRippleConfig,
  width: Int,
  height: Int
) {
  if (drawable == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
    return
  }
  if (width <= 0 || height <= 0) {
    return
  }

  val mode = resolveRippleMode(config.mode)
  val resolvedRadius = config.radius ?: when (mode) {
    MenuRippleMode.CIRCLE -> min(width, height) / 2
    else -> RippleDrawable.RADIUS_AUTO
  }
  drawable.radius = resolvedRadius
}

private fun resolveRippleMode(value: String?): MenuRippleMode {
  return when (value?.lowercase(Locale.US)) {
    "circle" -> MenuRippleMode.CIRCLE
    "bounded" -> MenuRippleMode.BOUNDED
    else -> MenuRippleMode.AUTO
  }
}

private fun buildRippleDrawable(
  context: Context,
  borderless: Boolean,
  cornerRadius: Int?
): Drawable? {
  val themeDrawable = resolveThemeDrawable(
    context,
    if (borderless) {
      android.R.attr.selectableItemBackgroundBorderless
    } else {
      android.R.attr.selectableItemBackground
    }
  )

  if (cornerRadius == null) {
    return themeDrawable ?: createFallbackRippleDrawable(context, null)
  }

  val mask = GradientDrawable().apply {
    shape = GradientDrawable.RECTANGLE
    this.cornerRadius = cornerRadius.toFloat()
    setColor(android.graphics.Color.WHITE)
  }
  return createFallbackRippleDrawable(context, mask)
}

private fun resolveThemeDrawable(context: Context, attr: Int): Drawable? {
  val outValue = TypedValue()
  val resolved = context.theme.resolveAttribute(attr, outValue, true)
  if (!resolved || outValue.resourceId == 0) {
    return null
  }
  return ContextCompat.getDrawable(context, outValue.resourceId)
}

private fun createFallbackRippleDrawable(
  context: Context,
  mask: Drawable?
): RippleDrawable? {
  val rippleColor = resolveThemeColor(context, android.R.attr.colorControlHighlight)
    ?: android.graphics.Color.parseColor("#33000000")
  val colorStateList = ColorStateList.valueOf(rippleColor)
  return RippleDrawable(colorStateList, null, mask)
}

private fun resolveThemeColor(context: Context, attr: Int): Int? {
  val outValue = TypedValue()
  val resolved = context.theme.resolveAttribute(attr, outValue, true)
  if (!resolved) {
    return null
  }
  return if (outValue.resourceId != 0) {
    ContextCompat.getColor(context, outValue.resourceId)
  } else {
    outValue.data
  }
}

private fun clearRipple(view: View) {
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
    view.foreground = null
  } else {
    view.background = null
  }
}
