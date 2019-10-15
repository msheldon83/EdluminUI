// export const PageLoadingIndicatorFullScreen: React.FunctionComponent<{}> = props => {
//   const classes = useStyles();

//   return (
//     <PageLoadingContext.Consumer>
//       {([state, _]) => {
//         const isLoading = state.isShowingIndicator && state.isFullScreen;

//         return (
//           <>
//             <Fade in={isLoading} timeout={SHOW_DELAY} unmountOnExit>
//               <div className={classes.overlayContainer}>
//                 <div className={classes.overlay}>
//                   <div className={classes.overlayContent}>
//                     <CircularProgress />
//                   </div>
//                 </div>
//               </div>
//             </Fade>
//             {isLoading ? (
//               <div className={classes.hiddenLoading}>{props.children}</div>
//             ) : (
//               props.children
//             )}
//           </>
//         );
//       }}
//     </PageLoadingContext.Consumer>
//   );
// };

// const useStyles = makeStyles(theme => ({
//   progressBar: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     zIndex: 1000000,
//   },
//   overlay: {
//     backgroundColor: theme.customColors.appBackgroundGray,
//     // backgroundColor: "green",
//     flexGrow: 1,
//     display: "flex",
//     alignItems: "center",
//     flexDirection: "column",
//   },
//   overlayContent: {
//     // backgroundColor: "blue",
//     alignItems: "center",
//   },
//   overlayContainer: {},
//   hiddenLoading: {
//     display: "none",
//   },
// }));
