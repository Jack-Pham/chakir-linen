import React from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import {mapStateToProps, mapDispatchToProps} from '../containerProps'
import {EmailConfirmContainer} from 'theme'

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EmailConfirmContainer));
