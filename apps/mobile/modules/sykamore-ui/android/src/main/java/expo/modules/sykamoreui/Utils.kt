package expo.modules.sykamoreui

import android.graphics.Color as AndroidColor
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.graphics.vector.ImageVector

// Extension property to convert Android Color to Compose Color
val AndroidColor?.compose: ComposeColor
  get() = this?.let {
    ComposeColor(android.graphics.Color.red(this), android.graphics.Color.green(this), android.graphics.Color.blue(this), android.graphics.Color.alpha(this))
  } ?: ComposeColor.Unspecified

// Extension property with nullable result
val AndroidColor?.composeOrNull: ComposeColor?
  get() = this?.let {
    ComposeColor(android.graphics.Color.red(this), android.graphics.Color.green(this), android.graphics.Color.blue(this), android.graphics.Color.alpha(this))
  }

@Composable
fun colorToComposeColor(color: AndroidColor?): ComposeColor {
  return color?.compose ?: MaterialTheme.colorScheme.onSurface
}

@Composable
fun DynamicTheme(content: @Composable () -> Unit) {
  MaterialTheme {
    content()
  }
}

// Basic icon mapping - extend as needed
fun getImageVector(iconName: String): ImageVector? {
  return when (iconName.lowercase()) {
    "add" -> Icons.Default.Add
    "delete" -> Icons.Default.Delete
    "edit" -> Icons.Default.Edit
    "close" -> Icons.Default.Close
    "check" -> Icons.Default.Check
    "settings" -> Icons.Default.Settings
    "more" -> Icons.Default.MoreVert
    "share" -> Icons.Default.Share
    "favorite" -> Icons.Default.Favorite
    "home" -> Icons.Default.Home
    "search" -> Icons.Default.Search
    "menu" -> Icons.Default.Menu
    "person" -> Icons.Default.Person
    "refresh" -> Icons.Default.Refresh
    "info" -> Icons.Default.Info
    else -> null
  }
}

