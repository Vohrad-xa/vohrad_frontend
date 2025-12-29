package expo.modules.sykamoremenu

import android.os.Build
import android.util.Log
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import java.util.Locale

val DisabledMenuColor = Color(0x77888888)

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

  MaterialTheme(colorScheme = colors) {
    content()
  }
}

/**
 * Resolves the icon color based on action attributes.
 */
fun resolveIconColor(
  action: SykaMenuActionRecord,
  isSubmenuTrigger: Boolean
): Color? {
  val isDisabled = action.attributes?.disabled == true
  val isDestructive = action.attributes?.destructive == true ||
    (isSubmenuTrigger && action.menuOptions?.destructive == true)
  val imageColor = action.imageColor?.let { Color(it) }

  return when {
    isDestructive -> Color.Red
    isDisabled -> DisabledMenuColor
    imageColor != null -> imageColor
    else -> null
  }
}
