import { useCallback, useState } from 'react'
import { makeStyles, Theme, createStyles, DialogContent, DialogActions, Grid } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useI18N } from '../../utils/i18n-next-ui'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { InjectedDialog } from '../../components/shared/InjectedDialog'
import { useAccount } from '../hooks/useAccount'
import { useChainIdValid } from '../hooks/useChainState'
import { ApproveState, useERC20TokenApproveCallback } from '../hooks/useERC20TokenApproveCallback'
import type { ERC20TokenDetailed } from '../types'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance } from '../../plugins/Wallet/formatter'
import BigNumber from 'bignumber.js'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            padding: theme.spacing(4, 2),
        },
    }),
)

export interface UnlockERC20TokenDialogProps {}

export function UnlockERC20TokenDialog(props: UnlockERC20TokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const [token, setToken] = useState<ERC20TokenDetailed | null>(null)
    const [amount, setAmount] = useState('0')
    const [spender, setSpender] = useState('')

    //#region context
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    //#endregion

    //#region approve
    const [approveState, approveCallback] = useERC20TokenApproveCallback(token?.address ?? '', amount, spender)
    const onApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback()
    }, [approveState])

    const onExactApprove = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        await approveCallback(true)
    }, [approveState])
    //#endregion

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.unlockERC20TokenDialogUpdated, (ev) => {
        if (ev.open) {
            setAmount(ev.amount)
            setToken(ev.token)
            setSpender(ev.spender)
        }
    })
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const renderGrid = (content: React.ReactNode) => (
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {content}
        </Grid>
    )

    if (!token) return null
    return (
        <InjectedDialog title="Unlock xxx" open={open} onClose={onClose}>
            <DialogContent className={classes.content}></DialogContent>
            <DialogActions>
                {approveState === ApproveState.NOT_APPROVED
                    ? renderGrid(
                          <>
                              <Grid item xs={6}>
                                  <ActionButton
                                      className={classes.button}
                                      fullWidth
                                      variant="contained"
                                      size="large"
                                      onClick={onExactApprove}>
                                      {`Unlock ${formatBalance(new BigNumber(amount), token?.decimals ?? 0, 2)} ${
                                          token?.symbol ?? 'Token'
                                      }`}
                                  </ActionButton>
                              </Grid>
                              <Grid item xs={6}>
                                  <ActionButton
                                      className={classes.button}
                                      fullWidth
                                      variant="contained"
                                      size="large"
                                      onClick={onApprove}>
                                      {approveState === ApproveState.NOT_APPROVED ? `Infinite Unlock` : ''}
                                  </ActionButton>
                              </Grid>
                          </>,
                      )
                    : null}
                {approveState === ApproveState.PENDING
                    ? renderGrid(
                          <Grid item xs={12}>
                              <ActionButton
                                  className={classes.button}
                                  fullWidth
                                  variant="contained"
                                  size="large"
                                  disabled={approveState === ApproveState.PENDING}>
                                  {`Unlocking ${token?.symbol ?? 'Token'}…`}
                              </ActionButton>
                          </Grid>,
                      )
                    : null}
                {!account || !chainIdValid
                    ? renderGrid(
                          <Grid item xs={12}>
                              <ActionButton
                                  className={classes.button}
                                  fullWidth
                                  variant="contained"
                                  size="large"
                                  onClick={onConnect}>
                                  {t('plugin_wallet_connect_a_wallet')}
                              </ActionButton>
                          </Grid>,
                      )
                    : null}
            </DialogActions>
        </InjectedDialog>
    )
}
