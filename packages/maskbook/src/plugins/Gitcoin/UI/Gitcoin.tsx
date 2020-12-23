import { PluginGitcoinRPC } from '../messages'
import { useAsyncRetry } from 'react-use'

export interface GitcoinProps {
    url: string
}

export function Gitcoin(props: GitcoinProps) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    const { value: data } = useAsyncRetry(() => PluginGitcoinRPC.fetchGrant(id), [id])

    console.log('DEBUG: fetch gitcoin')
    console.log(data)

    return <h1>HELLO GRANT</h1>

    // const grantTitle = title ?? 'A Gitcoin Grant'

    // //#region the donate dialog
    // const account = useAccount()
    // const [open, setOpen] = useState(false)
    // const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    // const onRequest = useCallback(() => {
    //     if (account) {
    //         setOpen(true)
    //         return
    //     }
    //     setSelectProviderDialogOpen({
    //         open: true,
    //     })
    // }, [account, setOpen, setSelectProviderDialogOpen])
    // //#endregion

    // return (
    //     <>
    //         <PreviewCard
    //             logo={image}
    //             title={grantTitle}
    //             line1={BigNumber.isBigNumber(estimatedAmount) ? `${estimatedAmount.toFixed(2)} USD` : ''}
    //             line2="ESTIMATED"
    //             line3={BigNumber.isBigNumber(daiAmount) ? `${formatBalance(daiAmount, 18, 18)} DAI` : ''}
    //             line4={isNumber(transactions) ? `${transactions} transactions` : ''}
    //             address={donationAddress}
    //             originalURL={url}
    //             onRequestGrant={onRequest}
    //         />
    //         <DonateDialog
    //             address={donationAddress}
    //             title={grantTitle}
    //             open={!!(open && donationAddress?.length)}
    //             onClose={() => setOpen(false)}
    //         />
    //     </>
    // )
}
