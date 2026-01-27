package expo.modules.sykamoremenu

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.Serializable

data class MenuAttributes(
  @Field val destructive: Boolean = false,
  @Field val disabled: Boolean = false,
  @Field val hidden: Boolean = false,
  @Field val keepsMenuPresented: Boolean = false
) : Record, Serializable

data class MenuOptions(
  @Field val singleSelection: Boolean? = null,
  @Field val destructive: Boolean? = null,
  @Field val displayInline: Boolean? = null
) : Record, Serializable

data class SykaMenuActionRecord(
  @Field val id: String? = null,
  @Field val title: String = "",
  @Field val separator: Boolean = false,
  @Field val titleColor: Int? = null,
  @Field val subtitle: String? = null,
  @Field val attributes: MenuAttributes? = null,
  @Field val state: String? = null,
  @Field val image: String? = null,
  @Field val imageColor: Int? = null,
  @Field val menuOptions: MenuOptions? = null,
  @Field val subactions: Array<SykaMenuActionRecord> = emptyArray(),
  @Field val preferredElementSize: String? = null
) : Record, Serializable

data class MenuHitSlop(
  @Field val top: Int = 0,
  @Field val bottom: Int = 0,
  @Field val left: Int = 0,
  @Field val right: Int = 0
) : Record, Serializable

class MenuOnPressActionEvent(
  @Field val event: String
) : Record, Serializable

class MenuOnOpenEvent : Record, Serializable

class MenuOnCloseEvent : Record, Serializable
