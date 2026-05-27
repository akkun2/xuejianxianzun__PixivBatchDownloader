import { Config } from '../Config'
import { EVT } from '../EVT'
import { pageType } from '../PageType'
import { Tools } from '../Tools'
import { Utils } from '../utils/Utils'
import { states } from '../store/States'
import { pinOption } from './PinOptions'
import { showNewIcon } from './ShowNewIcon'
import { settings } from './Settings'

/**控制每个设置的隐藏和显示 */
class Options {
  public init(allOption: NodeListOf<HTMLElement>) {
    this.allOption = allOption
    this.bindEvents()

    pinOption.init(allOption)
    showNewIcon.init(allOption)
  }

  private allOption!: NodeListOf<HTMLElement>

  /** 定制的设置项，不在公开版本里显示 */
  private customOptions = [15, 42, 79, 80, 92]

  /** 一些设置在移动端不会生效，所以隐藏它们 */
  // 主要是和作品缩略图相关的一些设置、增强功能
  private hideOnMobile = [18, 68, 55, 62, 40]

  /** 大部分设置在 pixivision 里都不适用，所以需要隐藏它们 */
  private hideOnPixivision = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 19, 21, 22, 23,
    24, 26, 27, 28, 30, 31, 33, 34, 35, 36, 37, 38, 39, 40, 43, 44, 46, 47, 48,
    49, 50, 54, 55, 56, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 72,
    73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
    92, 94, 95, 96, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107,
  ]

  private bindEvents() {
    window.addEventListener(EVT.list.settingInitialized, () => {
      this.display()
    })

    window.addEventListener(EVT.list.settingChange, (ev: CustomEventInit) => {
      if (!states.settingInitialized) {
        return
      }
      const data = ev.detail.data as any
      // if (data.name === 'showAdvancedSettings') {
      //   this.display()
      // }
    })

    window.addEventListener(EVT.list.pageSwitch, () => {
      window.setTimeout(() => {
        this.display()
      }, 0)
    })

    // 点击设置项的卡片时，如果它有一个 checkBox 总开关，那么就切换该设置的启用/禁用状态
    this.allOption.forEach((option) => {
      Utils.click(option, (ev) => {
        if (!settings.clickSettingCardToToggleSwitch) {
          return
        }

        if (!(ev.target instanceof HTMLElement)) {
          return
        }
        const target = ev.target

        // 只在点击该设置卡片上的空白区域时才切换开关状态，以避免和卡片上其他元素的事件发生冲突
        // 匹配两种点击的元素：
        // 1. 点击了卡片本身，说明点击在了卡片的空白区域上
        // 2. 点击了子选项容器，这表示该设置已经启用，所以子选项容器显示了出来。此时点击空白处，大概率是点击到了子选项容器上。
        // PS: 不管该设置是否启用，都可以点击到卡片上.只不过子选项容器显示之后，可点击到卡片的区域很小.
        if (target === option || target.matches('.subOptionWrap')) {
          // 只查找第一个开关，因为设置的总开关始终是第一个
          const switchEl = option.querySelector(
            'input.need_beautify.checkbox_switch'
          ) as HTMLElement
          if (!switchEl) {
            return
          }

          // 但是有些设置本身没有总开关，子选项里却有开关(例如"标签别名")，所以第一个开关可能是子选项里的开关，需要进一步判断
          // 要求这个 input 的前一个元素是 a.settingNameStyle 标签(也就是设置名称)，这样才能确保它是总开关，而不是子选项的开关
          // 现在我没有执行这个判断（这是有意为之的），这意味着：
          // 点击这个设置卡片的空白区域时，总是会切换第一个开关(不管它是总开关还是子开关)
          switchEl.click()
        }
      })
    })
  }

  /** 处理每个选项的显示与隐藏 */
  private display() {
    for (const option of this.allOption) {
      if (option.dataset.no === undefined) {
        continue
      }

      const no = Number.parseInt(option.dataset.no)

      // 先判断它是否需要隐藏
      const needHide = this.needHideOption(no)
      if (needHide) {
        this.hideOption([no])
        continue
      }

      this.showOption([no])
    }
  }

  /** 判断是否需要隐藏某个设置 */
  private needHideOption(no: number) {
    if (this.customOptions.includes(no)) {
      return true
    }

    if (Config.mobile) {
      if (this.hideOnMobile.includes(no)) {
        return true
      }
    }

    if (pageType.type === pageType.list.Pixivision) {
      if (this.hideOnPixivision.includes(no)) {
        return true
      }
    }
    return false
  }

  /** 隐藏指定的选项 */
  public hideOption(no: number[]) {
    this.setDisplay(no, 'none')
  }

  /** 显示指定的选项 */
  public showOption(no: number[]) {
    this.setDisplay(no, 'flex')
  }

  /** 显示或隐藏指定的选项 */
  private setDisplay(no: number[], display: string) {
    for (const number of no) {
      // 抓取多少页面/作品的显示与否不是在这里控制的，所以跳过它们
      if (number === 0 || number === 1) {
        continue
      }
      const option = Tools.getOption(this.allOption, number)
      if (option) {
        option.style.display = display
      }
    }
  }
}

const options = new Options()
export { options }
